import { ConsultantReview } from "@prisma/client";
import Review from "./Review";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareIcon } from "lucide-react";

interface ReviewsSectionProps {
  reviews: ConsultantReview[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gray-900 rounded-lg">
            <MessageSquareIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900">
              Reviews & Feedback
            </h3>
            <p className="text-gray-600">
              {reviews?.length || 0} review
              {(reviews?.length || 0) !== 1 ? "s" : ""} from our community
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => <Review key={review.id} {...review} />)
          ) : (
            <div className="text-center py-12">
              <MessageSquareIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 mb-2">No reviews yet</p>
              <p className="text-gray-400">
                Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
