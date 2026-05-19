export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title: string
      description?: string
      variant?: "default" | "destructive"
    }) => {
      const prefix = variant === "destructive" ? "[Error] " : ""
      alert(`${prefix}${title}${description ? ": " + description : ""}`)
    },
  }
}
