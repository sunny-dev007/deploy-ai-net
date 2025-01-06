interface LoadingDotsProps {
  color?: string;
}

export default function LoadingDots({ color = 'white' }: LoadingDotsProps) {
  return (
    <div className="flex space-x-1">
      <div className={`w-1.5 h-1.5 bg-${color} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
      <div className={`w-1.5 h-1.5 bg-${color} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
      <div className={`w-1.5 h-1.5 bg-${color} rounded-full animate-bounce`}></div>
    </div>
  );
} 