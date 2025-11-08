const GBIF_BASE = 'https://api.gbif.org/v1'

export type Species = {
	key: number
	scientificName: string
	canonicalName?: string
	vernacularName?: string
	kingdom?: string
	phylum?: string
	order?: string
	family?: string
	genus?: string
}

export type InsectImage = {
	url: string
	license?: string
	source?: string
	rightsHolder?: string
	country?: string
	locality?: string
}

export type InsectFlashcard = {
	species: Species
	images: InsectImage[]
}

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Request failed: ${res.status} ${res.statusText}`)
	}
	return (await res.json()) as T
}

// no-op placeholder removed; species search is not used in occurrence-first flow

type OccurrenceSearchResponse = {
	results: Array<{
		key: number
		speciesKey?: number
		taxonKey?: number
		country?: string
		locality?: string
		media?: Array<{
			type?: string
			identifier?: string
			license?: string
			references?: string
			rightsHolder?: string
		}>
	}>
}

const INSECTA_KEY: number = 216;

async function getRandomSpecies(): Promise<Species> {
	const maxAttempts = 12
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
		const occUrl = `${GBIF_BASE}/occurrence/search?media_type=StillImage&taxonomicStatus=ACCEPTED&basisOfRecord=MACHINE_OBSERVATION&basisOfRecord=LIVING_SPECIMEN&basisOfRecord=HUMAN_OBSERVATION&isExtinct=false&taxon_key=${INSECTA_KEY}&limit=1&shuffle=${seed}`
		const data = await fetchJson<OccurrenceSearchResponse>(occUrl)
		const occ = data.results?.[0]
		if (!occ) continue
		const speciesKey = occ.speciesKey ?? undefined
		if (!speciesKey) continue

		// Resolve species details
		const speciesUrl = `${GBIF_BASE}/species/${speciesKey}`
		const s = await fetchJson<{
			key: number
			scientificName: string
			canonicalName?: string
			vernacularName?: string
			kingdom?: string
			phylum?: string
			order?: string
			family?: string
			genus?: string
		}>(speciesUrl)

		return {
			key: s.key,
			scientificName: s.scientificName,
			canonicalName: s.canonicalName,
			vernacularName: s.vernacularName,
			kingdom: s.kingdom,
			phylum: s.phylum,
			order: s.order,
			family: s.family,
			genus: s.genus,
		}
	}
	throw new Error('Could not resolve a species from occurrences')
}

import md5 from 'blueimp-md5'

async function getOccurrencesWithImages(speciesKey: number): Promise<InsectImage[]> {
	const url = `${GBIF_BASE}/occurrence/search?limit=10&media_type=StillImage&isExtinct=false&basisOfRecord=MACHINE_OBSERVATION&basisOfRecord=LIVING_SPECIMEN&basisOfRecord=HUMAN_OBSERVATION&taxon_key=${speciesKey}`
	const data = await fetchJson<OccurrenceSearchResponse>(url)
	const images: InsectImage[] = []
	for (const occ of data.results ?? []) {
		for (const m of occ.media ?? []) {
			if (m.type && m.type !== 'StillImage') continue
			if (!m.identifier) continue
			// Build GBIF cached image URL per docs:
			// https://techdocs.gbif.org/en/openapi/images
			const hash = md5(m.identifier)
			// Use size-limited cache (max ~1200px on longest side)
			const cacheUrl = `${GBIF_BASE}/image/cache/1200x/occurrence/${occ.key}/media/${hash}`
			images.push({
				url: cacheUrl,
				license: m.license,
				source: m.references,
				rightsHolder: m.rightsHolder,
				country: occ.country,
				locality: occ.locality,
			})
		}
	}
	return images
}

export async function fetchRandomInsectWithImages(maxAttempts = 5): Promise<InsectFlashcard> {
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			const species = await getRandomSpecies()
			const images = await getOccurrencesWithImages(species.key)
			if (images.length > 0) {
				return { species, images }
			}
			// If species has no images, try again
		} catch {
			// Silent retry on transient/randomization failures
			continue
		}
	}
	// As a last resort, throw to let the UI retry via React Query
	throw new Error('No images found after several attempts')
}


