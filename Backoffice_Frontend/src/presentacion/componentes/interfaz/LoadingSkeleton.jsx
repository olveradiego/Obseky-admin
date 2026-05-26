import { LoadingState } from "./LoadingState";

export const LoadingSkeleton = ({ variant = "table", ...props }) => <LoadingState variant={variant} {...props} />;
