import { LoaderCircleIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const LoadingPdf = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("h-full w-full", className)} {...props}>
			<LoaderCircleIcon className="h-full w-full animate-spin"></LoaderCircleIcon>
		</div>
	)
)

export { LoadingPdf }
