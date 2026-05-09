import { FileText, ReceiptText } from "lucide-react";
import { createQuotationFromBoq } from "@/features/documents/actions";
import { Button } from "@/components/ui/button";

export function CreateDocumentButtons({ boqId }: { boqId: string }) {
  return (
    <form action={createQuotationFromBoq}>
      <input type="hidden" name="boqId" value={boqId} />
      <Button className="w-full">
        <FileText className="h-4 w-4" />
        Convert to quotation
        <ReceiptText className="h-4 w-4" />
      </Button>
    </form>
  );
}
