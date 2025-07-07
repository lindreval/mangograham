import Link from "next/link"
import { Button } from "@/components/ui/button" // adjust the path as needed

export default function SubmitButton() {
  return (
    <Button asChild size="sm">
      <Link href="/submit">Submit</Link>
    </Button>
  )
}