
import './App.css'
import useSocket from './hooks/useSocket'


function App() {
  const {loading, socket} = useSocket()

  if(loading) {
    return <div>
      laoding...
    </div>
  }
  
  return (
    <div className='flex'>
      <div className='flex-1'>
        SideBar
      </div>
      <div className='flex-6'>
      chatWindow
      </div>
    </div>
  )
}

export default App
