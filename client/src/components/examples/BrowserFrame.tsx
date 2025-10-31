import BrowserFrame from '../BrowserFrame';

export default function BrowserFrameExample() {
  return (
    <div className="h-screen">
      <BrowserFrame
        url="https://example.com"
        isActive={true}
        onTitleChange={(title) => console.log('Title changed:', title)}
      />
    </div>
  );
}
