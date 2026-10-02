import { useState, useEffect, useCallback } from 'react'
import { fetchPosts, createPost } from './api'
import MessageForm from './components/MessageForm'
import PostList from './components/PostList'
import './App.css'

const DEPLOYER_NAME = import.meta.env.VITE_DEPLOYER_NAME
const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchPosts()
      setPosts(data)
      setFetchError(null)
    } catch {
      setFetchError('게시글을 불러오지 못했어요.')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (DEPLOYER_NAME) {
        createPost({ type: 'deploy', name: DEPLOYER_NAME }).catch(() => {})
      }
      await loadPosts()
      setLoading(false)
    }
    init()

    const timer = setInterval(loadPosts, 10000)
    return () => clearInterval(timer)
  }, [loadPosts])

  const handleSubmit = async (name, message) => {
    await createPost({ type: 'message', name, message })
    await loadPosts()
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">배포 인증 방명록</h1>
        <p className="header-sub">배포 완료 자동으로 이름이 올라가요</p>
        {DEPLOYER_NAME && (
          <div className="header-deploy-badge">
            <span>🚀</span>
            <span>
              <strong>{DEPLOYER_NAME}</strong>님이 배포한 사이트예요
            </span>
          </div>
        )}
      </header>

      <main className="main">
        <MessageForm onSubmit={handleSubmit} />

        <section>
          <div className="feed-header">
            <h2 className="feed-title">방명록</h2>
            <span className="feed-count">{posts.length}</span>
          </div>
          {loading ? (
            <div className="feed-status">
              <span className="spinner" />
            </div>
          ) : fetchError ? (
            <div className="feed-error">
              <p className="feed-error-title">서버에 연결할 수 없어요</p>
              {!API_URL ? (
                <p className="feed-error-desc">
                  <code>VITE_API_URL</code> 환경변수가 설정되지 않았어요
                </p>
              ) : (
                <>
                  <p className="feed-error-desc">잠시 후 자동으로 다시 시도할게요</p>
                  <button className="feed-error-retry" onClick={loadPosts}>
                    지금 다시 시도
                  </button>
                </>
              )}
            </div>
          ) : (
            <PostList posts={posts} />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
