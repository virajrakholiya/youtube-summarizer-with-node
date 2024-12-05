import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { ClipLoader } from 'react-spinners'
import { useRemark } from 'react-remark'

function Summarizer() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [markdown, setMarkdown] = useRemark()
  const { token, logout } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMarkdown('')
    setThumbnail('')

    try {
      const videoId = new URL(url).searchParams.get("v")
      if (!videoId) {
        throw new Error('Invalid YouTube URL')
      }

      const response = await axios.post('http://localhost:3000/', {
        url,
        messages: []
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Format the response with proper markdown
      const formattedSummary = response.data.summary
        .replace(/\n/g, '\n\n')  // Ensure proper line breaks
        .replace(/^#/gm, '##')   // Adjust heading levels
      
      setMarkdown(formattedSummary)
      setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
      } else {
        setError(err.message || 'Failed to summarize video')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            YouTube Video Summarizer
          </h1>
          <button 
            onClick={logout}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
          >
            Logout
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="w-full px-6 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-300 disabled:opacity-50 text-lg font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ClipLoader color="#ffffff" size={24} />
                <span>Generating Summary...</span>
              </>
            ) : (
              'Summarize'
            )}
          </button>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4 my-12">
            <ClipLoader color="#1f2937" size={50} />
            <p className="text-gray-600">Analyzing video content...</p>
          </div>
        )}

        {thumbnail && !loading && (
          <div className="mb-8">
            <img 
              src={thumbnail} 
              alt="Video Thumbnail" 
              className="w-full rounded-lg shadow-lg object-cover max-h-[400px]"
              onError={(e) => {
                e.target.src = `https://img.youtube.com/vi/${new URL(url).searchParams.get("v")}/hqdefault.jpg`
              }}
            />
          </div>
        )}

        {markdown && !loading && (
          <div className="bg-gray-100 rounded-lg shadow-inner p-8">
            <div className="prose prose-lg max-w-none">
              <article className="markdown-body">
                {markdown}
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Summarizer