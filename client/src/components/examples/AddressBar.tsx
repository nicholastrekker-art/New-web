import AddressBar from '../AddressBar';

export default function AddressBarExample() {
  return (
    <AddressBar
      currentUrl="https://www.example.com"
      isLoading={false}
      canGoBack={true}
      canGoForward={false}
      onNavigate={(url) => console.log('Navigate to:', url)}
      onBack={() => console.log('Go back')}
      onForward={() => console.log('Go forward')}
      onRefresh={() => console.log('Refresh')}
      onHome={() => console.log('Go home')}
    />
  );
}
