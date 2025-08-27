import { useRouter } from 'next/router';
import Head from 'next/head';
import SVGViewer from '../../components/SVGViewer';
import { useEffect } from 'react';

export default function FloorPage() {
  const router = useRouter();
  const { property, floor } = router.query;

  useEffect(() => {
    // Add CSS to make the SVG viewer responsive and fill the iframe
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
      #__next {
        height: 100%;
      }
      .floor-view {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .svg-container {
        flex: 1;
        overflow: hidden;
      }
      .svg-container svg {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // If the page is not yet generated, this will be displayed initially
  if (!property || !floor) {
    return <div>Loading...</div>;
  }

  // Normalize property name for better URL handling
  const normalizedProperty = property.toLowerCase();
  
  // Normalize floor name to match SVG file naming
  let normalizedFloor;
  
  // Extract number from floor parameter (handles "etage-1", "etageplan_1", or just "1")
  const floorNumber = floor.replace(/\D/g, '');
  normalizedFloor = `Etageplan_${floorNumber}`;

  return (
    <div className="floor-view">
      <Head>
        <title>{`${property} - ${floor}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <SVGViewer 
        property={normalizedProperty} 
        floor={normalizedFloor} 
      />
    </div>
  );
}
