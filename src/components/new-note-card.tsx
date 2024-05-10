import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'


interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({onNoteCreated}: NewNoteCardProps) {
  const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [content, setContent] = useState('')

  function handleStartEditor(){
    setShouldShowOnBoarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>){

    setContent(event.target.value)

    if(event.target.value === ''){
      setShouldShowOnBoarding(true)
    }
  }

  function handleSaveNote(event: FormEvent){
    event.preventDefault()

    if(content == ''){
      return
    }

    onNoteCreated(content)

    setContent('')
    setShouldShowOnBoarding(true)

    toast.success('nota salva com sucesso!')
  }

  function handleStartRecording(){

    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable){
      toast.error('infelizmente, seu navegador não suporta gravação de áudio!')
      return
    }

    setIsRecording(true)
    setShouldShowOnBoarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)}, '')

      setContent(transcription)
    }
    
    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording(){
    setIsRecording(false)

    if (speechRecognition != null){
      speechRecognition.stop()
    }
  }

    return (
      <Dialog.Root>
        <Dialog.Trigger className='rounded-md flex flex-col bg-zinc-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-zinc-600 focus:ring-2 focus:ring-violet-400'>
          <span className='text-sm font-medium text-zinc-200'>adicionar nota</span>
          <p className='text-sm leading-6 text-zinc-400'>grave uma nota em áudio que será convertida para texto automaticamente</p>
        </Dialog.Trigger>

        <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50"/>
          <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-zinc-700 md:rounded-md flex flex-col outline-none'>
              <Dialog.Close className='absolute right-0 top-0 p-1.5 text-zinc-400 hover:text-zinc-100'>
                <X className='size-5'/>
              </Dialog.Close>

              <form className='flex-1 flex flex-col'>

                <div className='flex flex-1 flex-col gap-3 p-5'>
                  <span className='text-sm font-medium text-zinc-300'>
                    adicionar nota
                  </span>

                  {shouldShowOnBoarding ? (
                    <p className='text-sm leading-6 text-zinc-400'>
                    comece <button type='button' onClick={handleStartRecording} className='text-violet-400 hover:underline'>gravando a nota em áudio</button> ou, se preferir, em <button type='button' onClick={handleStartEditor} className='text-violet-400 hover:underline'>texto</button>
                  </p>
                  ):(
                    <textarea
                      autoFocus 
                      className='text-sm leading-6 text-zinc-400 bg-transparent resize-none flex-1 outline-none'
                      onChange = {handleContentChanged}
                      value = {content}/>
                  )}
                </div>
                
                {isRecording ? (
                  <button type="button" onClick={handleStopRecording} className='w-full flex items-center justify-center gap-2 bg-zinc-900 py-4 text-center text-sm text-zinc-300 outline-none font-medium hover:text-zinc-100'>
                  <div className='size-2 rounded-full bg-red-500 animate-ping' />
                  gravando! (clique para parar)
                </button>
                ) : (
                  <button type="button" onClick={handleSaveNote} className='w-full bg-violet-400 py-4 text-center text-sm text-violet-950 outline-none font-medium hover:bg-violet-500'>
                  salvar nota
                </button>
                )}

              </form>
          </Dialog.Content>
      </Dialog.Portal>
      </Dialog.Root>
    )}