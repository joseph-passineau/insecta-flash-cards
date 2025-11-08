import { useCallback, useMemo, useState } from 'react'
import { useRandomInsect } from '../hooks/useRandomInsect'
import ImageCarousel from '../components/ImageCarousel'

export default function Home() {
	const { data, isLoading, isError, error, refetchRandom, isFetching } = useRandomInsect()
	const [revealed, setRevealed] = useState(false)
	const [activeIndex, setActiveIndex] = useState(0)

	const activeImage = useMemo(() => data?.images?.[activeIndex], [data, activeIndex])

	const handleNext = useCallback(() => {
		setRevealed(false)
		setActiveIndex(0)
		refetchRandom()
	}, [refetchRandom])

	return (
		<main className="mx-auto flex min-h-dvh max-w-screen-sm flex-col items-stretch">
			<header className="px-4 py-3">
				<h1 className="text-center text-2xl font-semibold">Insecta Flash Cards</h1>
			</header>

			<section className="flex flex-1 flex-col gap-3 px-0">
				{isLoading || isFetching ? (
					<div className="grid flex-1 place-items-center">
						<div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
					</div>
				) : isError ? (
					<div className="px-4">
						<p className="rounded bg-red-900/40 p-3 text-sm text-red-200">
							Failed to load. {(error as Error)?.message ?? 'Unknown error'}
						</p>
						<div className="mt-3">
							<button
								onClick={() => refetchRandom()}
								className="rounded-full bg-emerald-500 px-4 py-2 font-medium text-emerald-950"
							>
								Retry
							</button>
						</div>
					</div>
				) : data ? (
					<>
						<ImageCarousel images={data.images} onIndexChange={setActiveIndex} />

						<div className="px-4">
							{revealed ? (
								<div className="rounded-lg bg-neutral-900 p-4">
									<div className="text-neutral-300">
										{data.species.vernacularName ? (
											<p className="text-lg font-medium">{data.species.vernacularName}</p>
										) : null}
										<p className="mt-0.5 font-semibold italic">{data.species.scientificName}</p>
										<div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-400">
											{data.species.order ? (
												<div>
													<span className="opacity-70">Order: </span>
													<span className="text-neutral-300">{data.species.order}</span>
												</div>
											) : null}
											{data.species.family ? (
												<div>
													<span className="opacity-70">Family: </span>
													<span className="text-neutral-300">{data.species.family}</span>
												</div>
											) : null}
											{data.species.genus ? (
												<div>
													<span className="opacity-70">Genus: </span>
													<span className="text-neutral-300 italic">{data.species.genus}</span>
												</div>
											) : null}
											{data.species.phylum ? (
												<div>
													<span className="opacity-70">Phylum: </span>
													<span className="text-neutral-300">{data.species.phylum}</span>
												</div>
											) : null}
										</div>
										{activeImage?.country || activeImage?.locality ? (
											<p className="mt-2 text-sm text-neutral-400">
												{[activeImage?.country, activeImage?.locality].filter(Boolean).join(' — ')}
											</p>
										) : null}
									</div>
								</div>
							) : (
								<button
									onClick={() => setRevealed(true)}
									className="w-full rounded-full bg-emerald-500 px-6 py-3 text-center font-medium text-emerald-950 transition hover:bg-emerald-400"
								>
									Reveal
								</button>
							)}
						</div>
					</>
				) : null}
			</section>

			<div className="sticky bottom-0 z-10 bg-neutral-950/80 px-4 py-3 backdrop-blur">
				<div className="flex items-center justify-between gap-2">
					<span className="text-xs text-neutral-500">Data from GBIF public API</span>
					<button
						onClick={handleNext}
						disabled={isFetching}
						className="rounded-full bg-neutral-200 px-4 py-2 text-neutral-900 disabled:opacity-60"
					>
						Next
					</button>
				</div>
			</div>
		</main>
	)
}


