import { useState, useRef, useEffect, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import { PoseLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const kModeloUrl = '/libras_model_tfjs/model.json'
const kIntervaloMs = 100
const kFramesPorAmostra = 30
const kLimiarConfianca = 0.75

const DIM_POSE = 33 * 4
const DIM_MAO = 21 * 3

const COLORS = {
  bg: '#0B1F3A',
  panel: '#102A4A',
  border: '#1E3A5F',
  text: '#F1F5F9',
  muted: '#94A3B8',
  orange: '#F97316',
  blue: '#3B82F6',
}

function extrairLandmarks(poseResult, handResult) {
  const pose = poseResult?.landmarks?.[0]
    ? poseResult.landmarks[0].flatMap(lm => [lm.x, lm.y, lm.z, lm.visibility ?? 0])
    : new Array(DIM_POSE).fill(0)

  let maoEsq = new Array(DIM_MAO).fill(0)
  let maoDir = new Array(DIM_MAO).fill(0)

  if (handResult?.landmarks?.length) {
    handResult.landmarks.forEach((lms, i) => {
      const label = handResult.handedness[i][0].categoryName
      const vetor = lms.flatMap(lm => [lm.x, lm.y, lm.z])
      if (label === 'Left') maoEsq = vetor
      else maoDir = vetor
    })
  }

  return [...pose, ...maoEsq, ...maoDir]
}

export default function LibrasRecognizer() {
  const videoRef = useRef(null)
  const intervaloRef = useRef(null)
  const poseRef = useRef(null)
  const handRef = useRef(null)
  const modeloRef = useRef(null)
  const janelaRef = useRef([])
  const tsRef = useRef(0)

  const [pronto, setPronto] = useState(false)
  const [ativo, setAtivo] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [status, setStatus] = useState('carregando')
  const [texto, setTexto] = useState('Aguardando reconhecimento...')
  const [statusSinal, setStatusSinal] = useState('aguardando')

  const adicionarTexto = (t) => {
    setTexto(prev => {
      if (!t || t === 'aguardando' || t === 'indefinido') return prev
      const novo = t.replace('_', ' ')
      if (prev.endsWith(novo)) return prev
      return prev + ' ' + novo
    })
  }

  const capturarEPrever = useCallback(() => {
    const video = videoRef.current
    const modelo = modeloRef.current
    if (!video || !modelo || !poseRef.current || !handRef.current) return

    tsRef.current += kIntervaloMs

    const poseResult = poseRef.current.detectForVideo(video, tsRef.current)
    const handResult = handRef.current.detectForVideo(video, tsRef.current)

    const vetor = extrairLandmarks(poseResult, handResult)

    janelaRef.current = [...janelaRef.current, vetor].slice(-kFramesPorAmostra)

    if (janelaRef.current.length < kFramesPorAmostra) return

    try {
      const probabilidades = preverSequencia(modeloRef.current, janelaRef.current)
      const data = montarResultado(modeloRef.current, probabilidades, janelaRef.current.length)

      setResultado(data)

      const valido =
        data?.confianca >= kLimiarConfianca &&
        data?.sinal !== 'indefinido' &&
        data?.sinal !== 'aguardando'

      if (!valido) {
        setStatusSinal('vazio')
        return
      }

      setStatusSinal('ok')
      adicionarTexto(data.sinal)
    } catch (e) {
      setStatus('erro')
      setStatusSinal('vazio')
    }
  }, [])

  const iniciar = useCallback(() => {
    if (intervaloRef.current) return
    janelaRef.current = []
    setTexto('Aguardando reconhecimento...')
    setStatusSinal('aguardando')
    setAtivo(true)
    intervaloRef.current = setInterval(capturarEPrever, kIntervaloMs)
  }, [capturarEPrever])

  const parar = useCallback(() => {
    clearInterval(intervaloRef.current)
    intervaloRef.current = null
    setAtivo(false)
    setStatusSinal('aguardando')
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, display: 'flex', flexDirection: 'column', padding: 16, gap: 16 }}>

      <div style={{ display: 'flex', gap: 16, flex: 1 }}>

        <div style={{ flex: 1, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 12 }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: 12 }} />

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={iniciar}
              disabled={!pronto || status !== 'ok'}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: 0,
                background: ativo ? '#ef4444' : COLORS.orange,
                color: '#fff'
              }}
            >
              {ativo ? 'Parar' : 'Iniciar'}
            </button>

            <button
              onClick={parar}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: 'transparent',
                color: COLORS.text
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{ flex: 1, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column' }}>

          <div style={{ fontSize: 14, color: COLORS.muted, marginBottom: 8 }}>
            Saída de texto
          </div>

          <div
            style={{
              flex: 1,
              background: '#0A1629',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 12,
              whiteSpace: 'pre-wrap',
              overflowY: 'auto',
              fontSize: 16,
              lineHeight: 1.5,
              color: statusSinal === 'vazio' ? COLORS.orange : COLORS.text
            }}
          >
            {statusSinal === 'vazio'
              ? 'Faça um sinal'
              : texto}
          </div>

        </div>

      </div>

      <div style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center' }}>
        LIBRAS Recognizer
      </div>

    </div>
  )
}