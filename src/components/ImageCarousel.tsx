import { useEffect, useMemo, useRef, useState } from 'react'
import type { InsectImage } from '../lib/gbif'

type Props = {
	images: InsectImage[]
	onIndexChange?: (index: number) => void
}

export default function ImageCarousel({ images, onIndexChange }: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [index, setIndex] = useState(0)

	const pages = useMemo(() => images, [images])

	useEffect(() => {
		onIndexChange?.(index)
	}, [index, onIndexChange])

	useEffect(() => {
		const el = containerRef.current
		if (!el) return
		function handleScroll() {
			const node = containerRef.current
			if (!node) return
			const w = node.clientWidth || 1
			const i = Math.round(node.scrollLeft / w)
			setIndex(Math.max(0, Math.min(pages.length - 1, i)))
		}
		el.addEventListener('scroll', handleScroll, { passive: true })
		return () => el.removeEventListener('scroll', handleScroll)
	}, [pages.length])

	function goTo(i: number) {
		const el = containerRef.current
		if (!el) return
		const w = el.clientWidth
		el.scrollTo({ left: i * w, behavior: 'smooth' })
	}

	useEffect(() => {
		setIndex(0)
		goTo(0)
	}, [pages])

	return (
		<div className="relative">
			<div
				ref={containerRef}
				className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
				style={{ scrollbarWidth: 'none' }}
			>
				{pages.map((img, i) => (
					<div key={i} className="relative grid min-h-[60dvh] w-full flex-[0_0_100%] snap-center place-items-center bg-neutral-900">
						<img
							src={img.url}
							alt=""
							className="max-h-[75dvh] w-full object-contain"
							loading={i <= 1 ? 'eager' : 'lazy'}
						/>
						<div className="pointer-events-none absolute bottom-2 right-2 max-w-[90%] rounded bg-black/60 px-2 py-1 text-[10px] leading-tight text-neutral-200">
							<div className="truncate">
								<span className="opacity-80">License: </span>
								{img.license ?? '—'}
							</div>
							{img.source ? (
								<div className="truncate">
									<span className="opacity-80">Source: </span>
									<a href={img.source} target="_blank" rel="noreferrer" className="pointer-events-auto underline">
										{img.source}
									</a>
								</div>
							) : null}
						</div>
					</div>
				))}
			</div>

			{pages.length > 1 ? (
				<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
					{pages.map((_, i) => (
						<button
							key={i}
							aria-label={`Go to image ${i + 1}`}
							onClick={() => goTo(i)}
							className={`h-2 w-2 rounded-full ${i === index ? 'bg-emerald-400' : 'bg-neutral-600'}`}
						/>
					))}
				</div>
			) : null}
		</div>
	)
}


