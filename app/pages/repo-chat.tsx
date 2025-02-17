import RepoChat from '../components/RepoChat';

export default function RepoChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Repository Chat Assistant</h1>
        <RepoChat />
      </div>
    </div>
  );
} 