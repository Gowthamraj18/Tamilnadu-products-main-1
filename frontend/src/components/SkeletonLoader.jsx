const SkeletonLoader = ({ type = 'product', count = 1 }) => {
  const ProductSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  )

  const CardSkeleton = () => (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </div>
  )

  const TextSkeleton = () => (
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
    </div>
  )

  const renderSkeleton = () => {
    switch (type) {
      case 'product':
        return <ProductSkeleton />
      case 'card':
        return <CardSkeleton />
      case 'text':
        return <TextSkeleton />
      default:
        return <ProductSkeleton />
    }
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}

export default SkeletonLoader
