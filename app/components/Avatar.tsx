export default function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div className="relative h-80 w-80 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-8xl font-bold shadow-2xl">
      {initial}
    </div>
  );
} 