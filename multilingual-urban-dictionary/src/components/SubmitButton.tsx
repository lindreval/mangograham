import Link from "next/link"
import { Button } from "@/components/ui/button" // adjust the path as needed

export default function SubmitButton() {
  return (
    <Button asChild size="sm" className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      <Link href="/submit">Submit</Link>
    </Button>
  )
}