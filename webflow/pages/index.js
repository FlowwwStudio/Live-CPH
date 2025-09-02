import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // This would be replaced with actual API call or static data
    // For now, hardcoding based on file structure
    setProperties([
      {
        name: 'Strandlodsvej',
        slug: 'strandlodsvej',
        floors: [0, 1, 2, 3, 4, 5, 6, 7]
      },
      {
        name: 'Vesterbrogade',
        slug: 'vesterbrogade',
        floors: [1, 2, 3, 4, 5]
      }
    ]);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>LiveCPH Ejendomsoversigt</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main>
        <h1>LiveCPH Ejendomsoversigt</h1>
        
        <div className="properties">
          {properties.map((property) => (
            <div key={property.slug} className="property-card">
              <h2>{property.name}</h2>
              <div className="floors">
                {property.floors.map((floor) => (
                  <Link key={floor} href={`/${property.slug}/etageplan_${floor}`}>
                    <a className="floor-link">Etage {floor}</a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        h1 {
          margin: 0;
          font-size: 2rem;
          text-align: center;
        }

        .properties {
          display: flex;
          flex-wrap: wrap;
          max-width: 800px;
          margin-top: 2rem;
        }

        .property-card {
          margin: 1rem;
          padding: 1.5rem;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          width: 300px;
        }

        .floors {
          display: flex;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .floor-link {
          margin: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #f0f0f0;
          border-radius: 5px;
          text-decoration: none;
          color: #333;
        }

        .floor-link:hover {
          background-color: #e0e0e0;
        }
      `}</style>
    </div>
  );
}
