import { useState } from 'react';

export default function BackendIntegrationExample() {
  const [helloMessage, setHelloMessage] = useState('');
  const [echoInput, setEchoInput] = useState('');
  const [echoOutput, setEchoOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  // Example 1: Fetch from /hello endpoint
  const fetchHello = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/hello`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setHelloMessage(data.message);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Error fetching hello:', err);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Post to /echo endpoint
  const sendEcho = async () => {
    if (!echoInput.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/echo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: echoInput }),
      });

      if (!response.ok) throw new Error('Failed to send echo');
      
      const data = await response.json();
      setEchoOutput(data.echo);
      setEchoInput('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Error sending echo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Examples commented out - refer to fetchHello() and sendEcho() functions for usage */}
      
      {/* 
      <h2 className="text-2xl font-bold mb-6">Backend Integration Examples</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-8 p-6 border rounded-lg bg-blue-50">
        <h3 className="text-xl font-semibold mb-4">Example 1: GET /api/hello</h3>
        <p className="text-sm text-gray-600 mb-4">
          Fetches a simple greeting from the backend.
        </p>
        
        <button
          onClick={fetchHello}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Hello'}
        </button>

        {helloMessage && (
          <div className="mt-4 p-3 bg-white border-l-4 border-blue-500">
            <p className="text-sm font-mono">{helloMessage}</p>
          </div>
        )}
      </div>

      <div className="mb-8 p-6 border rounded-lg bg-green-50">
        <h3 className="text-xl font-semibold mb-4">Example 2: POST /api/echo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Sends a message to the backend and receives an echo response.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={echoInput}
            onChange={(e) => setEchoInput(e.target.value)}
            placeholder="Enter a message..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={sendEcho}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Echo'}
          </button>
        </div>

        {echoOutput && (
          <div className="p-3 bg-white border-l-4 border-green-500">
            <p className="text-sm font-mono">Echo: {echoOutput}</p>
          </div>
        )}
      </div>

      <div className="p-6 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">Code Examples</h3>
        
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">GET Request:</h4>
          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`const response = await fetch('http://localhost:5000/api/hello');
const data = await response.json();
console.log(data.message);`}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">POST Request:</h4>
          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`const response = await fetch('http://localhost:5000/api/echo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' })
});
const data = await response.json();
console.log(data.echo);`}
          </pre>
        </div>
      </div>
      */}
    </div>
  );
}
