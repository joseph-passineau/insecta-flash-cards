import { useQuery } from '@tanstack/react-query'
import { fetchRandomInsectWithImages, type InsectFlashcard } from '../lib/gbif'

export function useRandomInsect() {
	const query = useQuery<InsectFlashcard>({
		queryKey: ['random-insect'],
		queryFn: () => fetchRandomInsectWithImages(),
	})

	function refetchRandom() {
		return query.refetch({ cancelRefetch: true })
	}

	return { ...query, refetchRandom }
}


