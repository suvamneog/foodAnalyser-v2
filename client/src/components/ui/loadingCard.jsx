import { Card, CardContent, CardHeader } from "./card";
import { CardBody, CardContainer, CardItem } from "./3D-card";

function LoadingCard() {
  return (
    <CardContainer className="w-full max-w-xs mx-auto"> {/* Match the max-width of the output card */}
      <CardBody className="bg-[#0C0C0C]/90 rounded-xl p-1 sm:p-2 md:p-3">
        <CardItem>
          <CardHeader className="p-2 sm:p-3">
            <div className="animate-pulse space-y-2">
              {/* Title Skeleton */}
              <div className="h-6 bg-gray-700 rounded w-3/4 sm:w-2/3 md:w-3/4"></div>
              {/* Subtitle Skeleton */}
              <div className="h-4 bg-gray-700 rounded w-1/2 sm:w-1/2 md:w-1/2"></div>
            </div>
          </CardHeader>
        </CardItem>

        <CardItem>
          <CardContent className="px-2 py-1 sm:p-3">
            <div className="grid gap-2 sm:gap-3">
              {/* Calories Skeleton */}
              <div className="animate-pulse flex items-center justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/3 sm:w-1/4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/4 sm:w-1/5"></div>
              </div>

              {/* Nutrition Grid Skeleton */}
              <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                {[1, 2, 3].map((i) => (
                  <CardItem key={i}>
                    <Card className="bg-[#0C0C0C] border-white/[0.05]">
                      <CardHeader className="p-1 sm:p-2 md:p-3">
                        <div className="animate-pulse space-y-2">
                          {/* Nutrition Label Skeleton */}
                          <div className="h-4 bg-gray-700 rounded w-2/3 sm:w-1/2"></div>
                          {/* Nutrition Value Skeleton */}
                          <div className="h-5 bg-gray-700 rounded w-1/2 sm:w-1/3"></div>
                        </div>
                      </CardHeader>
                    </Card>
                  </CardItem>
                ))}
              </div>

              {/* Pros & Cons Skeleton */}
              <CardItem>
                <div className="animate-pulse space-y-4">
                  {/* Pros & Cons Title Skeleton */}
                  <div className="h-4 bg-gray-700 rounded w-1/3 sm:w-1/4"></div>
                  {/* Pros & Cons List Skeleton */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-3/4 sm:w-4/5"></div>
                    <div className="h-3 bg-gray-700 rounded w-5/6 sm:w-5/6"></div>
                    <div className="h-3 bg-gray-700 rounded w-full sm:w-full"></div>
                  </div>
                </div>
              </CardItem>
            </div>
          </CardContent>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

export default LoadingCard;