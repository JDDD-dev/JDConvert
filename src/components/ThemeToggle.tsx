import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
	const [theme, setThemeState] = useState<"theme-light" | "dark">("theme-light")

	useEffect(() => {
		const isDarkMode = document.documentElement.classList.contains("dark")
		setThemeState(isDarkMode ? "dark" : "theme-light")
	}, [])

	useEffect(() => {
		const isDark = theme === "dark"
		document.documentElement.classList[isDark ? "add" : "remove"]("dark")
	}, [theme])

	function changeColor() {
		if (theme === "dark") setThemeState("theme-light")
		else setThemeState("dark")
	}

	return (
		<Button variant="ghost" size="icon" onClick={() => changeColor()}>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
		</Button>
	)
}
