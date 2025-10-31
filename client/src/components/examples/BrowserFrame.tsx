import BrowserFrame from '../BrowserFrame';

export default function BrowserFrameExample() {
  return (
    <div className="h-screen">
      <BrowserFrame
        url="https://example.com"
        isActive={true}
        onLoadStart={() => console.log('Loading started')}
        onLoadEnd={() => console.log('Loading ended')}
        onTitleChange={(title) => console.log('Title changed:', title)}
      />
    </div>
  );
}
