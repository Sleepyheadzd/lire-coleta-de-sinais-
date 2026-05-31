// LibrasRecognizer.jsx
//
// Dependencias:
//   npm install @mediapipe/tasks-vision @tensorflow/tfjs
//
// Modelo:
//   gere a pasta libras_model_tfjs com:
//   python exportar_tfjs.py
//
// Uso:
//   import LibrasRecognizer from './LibrasRecognizer'
//   <LibrasRecognizer />

import { useState, useRef, useEffect, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import { PoseLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const kModeloUrl        = '/libras_model_tfjs/model.json'
const kIntervaloMs      = 100
const kFramesPorAmostra = 30
const kLimiarConfianca  = 0.75

const DIM_POSE = 33 * 4
const DIM_MAO  = 21 * 3

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

async function carregarModelo(url) {
  const modelUrl = new URL(url, window.location.href)
  const manifest = await fetch(modelUrl).then(r => {
    if (!r.ok) throw new Error(`modelo nao encontrado: ${r.status}`)
    return r.json()
  })

  const pesosUrl = new URL(manifest.weightsPath, modelUrl)
  const buffer = await fetch(pesosUrl).then(r => {
    if (!r.ok) throw new Error(`pesos nao encontrados: ${r.status}`)
    return r.arrayBuffer()
  })

  const raw = new Float32Array(buffer)
  const weights = {}

  manifest.weights.forEach(spec => {
    const inicio = spec.offset
    const fim = spec.offset + spec.length
    weights[spec.name] = tf.tensor(raw.slice(inicio, fim), spec.shape, spec.dtype)
  })

  return {
    classes: manifest.classes,
    layers: manifest.layers,
    weights,
  }
}

function liberarModelo(modelo) {
  if (!modelo) return
  Object.values(modelo.weights).forEach(tensor => tensor.dispose())
}

function peso(modelo, nome) {
  return modelo.weights[nome]
}

function executarLstm(entrada, camada, modelo) {
  const kernel = peso(modelo, camada.kernel)
  const recurrentKernel = peso(modelo, camada.recurrentKernel)
  const bias = peso(modelo, camada.bias)
  const unidades = camada.units
  const timeSteps = entrada.shape[0]
  const inputDim = entrada.shape[1]

  let h = tf.zeros([unidades])
  let c = tf.zeros([unidades])
  const saidas = []

  for (let t = 0; t < timeSteps; t += 1) {
    const x = entrada.slice([t, 0], [1, inputDim])
    const z = x
      .matMul(kernel)
      .add(h.expandDims(0).matMul(recurrentKernel))
      .add(bias)
      .squeeze()

    const [i, f, g, o] = tf.split(z, 4)
    c = tf.sigmoid(f).mul(c).add(tf.sigmoid(i).mul(tf.tanh(g)))
    h = tf.sigmoid(o).mul(tf.tanh(c))

    if (camada.returnSequences) {
      saidas.push(h)
    }
  }

  if (camada.returnSequences) {
    return tf.stack(saidas)
  }

  return h
}

function executarDense(entrada, camada, modelo) {
  const kernel = peso(modelo, camada.kernel)
  const bias = peso(modelo, camada.bias)
  const x = entrada.rank === 1 ? entrada.expandDims(0) : entrada
  let saida = x.matMul(kernel).add(bias)

  if (camada.activation === 'relu') {
    saida = tf.relu(saida)
  } else if (camada.activation === 'softmax') {
    saida = tf.softmax(saida)
  }

  return saida.squeeze()
}

function preverSequencia(modelo, sequencia) {
  return tf.tidy(() => {
    let x = tf.tensor(sequencia, [kFramesPorAmostra, 258], 'float32')

    modelo.layers.forEach(camada => {
      if (camada.type === 'lstm') {
        x = executarLstm(x, camada, modelo)
      } else if (camada.type === 'dense') {
        x = executarDense(x, camada, modelo)
      }
    })

    return Array.from(x.dataSync())
  })
}

function montarResultado(modelo, probabilidades, frames) {
  const idx = probabilidades.reduce(
    (melhor, valor, i) => (valor > probabilidades[melhor] ? i : melhor),
    0,
  )

  const todos = Object.fromEntries(
    modelo.classes.map((classe, i) => [classe, probabilidades[i]]),
  )

  return {
    sinal: modelo.classes[idx] ?? 'indefinido',
    confianca: probabilidades[idx] ?? 0,
    todos,
    frames_acumulados: frames,
  }
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
  const [historico, setHistorico] = useState([])
  const [status, setStatus] = useState('carregando')
  const [frames, setFrames] = useState(0)

  useEffect(() => {
    let cancelado = false
    let stream = null

    async function init() {
      try {
        setStatus('carregando')

        const [modelo, vision] = await Promise.all([
          carregarModelo(kModeloUrl),
          FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
          ),
        ])

        const [pose, hand] = await Promise.all([
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            },
            runningMode: 'VIDEO',
          }),
          HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          }),
        ])

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        })

        if (cancelado) {
          stream.getTracks().forEach(track => track.stop())
          liberarModelo(modelo)
          return
        }

        modeloRef.current = modelo
        poseRef.current = pose
        handRef.current = hand

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setStatus('ok')
        setPronto(true)
      } catch (err) {
        console.error(err)
        setStatus('erro')
      }
    }

    init()

    return () => {
      cancelado = true
      clearInterval(intervaloRef.current)
      stream?.getTracks().forEach(track => track.stop())
      videoRef.current?.srcObject?.getTracks().forEach(track => track.stop())
      liberarModelo(modeloRef.current)
      modeloRef.current = null
    }
  }, [])

  const capturarEPrever = useCallback(() => {
    const video = videoRef.current
    const modelo = modeloRef.current
    if (!video || !modelo || video.readyState < 2 || !poseRef.current || !handRef.current) return

    tsRef.current += kIntervaloMs

    const poseResult = poseRef.current.detectForVideo(video, tsRef.current)
    const handResult = handRef.current.detectForVideo(video, tsRef.current)
    const vetor = extrairLandmarks(poseResult, handResult)

    janelaRef.current = [...janelaRef.current, vetor].slice(-kFramesPorAmostra)
    const totalFrames = janelaRef.current.length
    setFrames(totalFrames)

    if (totalFrames < kFramesPorAmostra) {
      setResultado({
        sinal: 'aguardando',
        confianca: 0,
        todos: {},
        frames_acumulados: totalFrames,
      })
      return
    }

    try {
      const probabilidades = preverSequencia(modelo, janelaRef.current)
      const data = montarResultado(modelo, probabilidades, totalFrames)

      setResultado(data)

      if (
        data.sinal !== 'aguardando' &&
        data.sinal !== 'indefinido' &&
        data.confianca >= kLimiarConfianca
      ) {
        setHistorico(h => {
          if (h[h.length - 1] === data.sinal) return h
          return [...h.slice(-9), data.sinal]
        })
      }
    } catch (err) {
      console.error(err)
      setStatus('erro')
    }
  }, [])

  const iniciar = useCallback(() => {
    if (intervaloRef.current) return
    janelaRef.current = []
    tsRef.current = 0
    setFrames(0)
    setResultado(null)
    setAtivo(true)
    intervaloRef.current = setInterval(capturarEPrever, kIntervaloMs)
  }, [capturarEPrever])

  const parar = useCallback(() => {
    clearInterval(intervaloRef.current)
    intervaloRef.current = null
    janelaRef.current = []
    setAtivo(false)
    setResultado(null)
    setFrames(0)
  }, [])

  useEffect(() => () => clearInterval(intervaloRef.current), [])

  const nomeExibido = resultado?.sinal?.replace('_', ' ') ?? ''
  const reconhecido = resultado &&
    resultado.sinal !== 'aguardando' &&
    resultado.sinal !== 'indefinido' &&
    resultado.confianca >= kLimiarConfianca

  return (
    <div style={s.container}>

      <div style={s.cameraWrap}>
        <video ref={videoRef} autoPlay playsInline muted style={s.video} />

        <div style={{ ...s.badge, background: corStatus(status) }}>
          {status === 'carregando' ? 'carregando...'
            : status === 'ok' ? 'tf.js ok'
            : status === 'erro' ? 'erro modelo'
            : ''}
        </div>

        {!pronto && (
          <div style={s.loading}>carregando mediapipe e modelo...</div>
        )}

        {ativo && frames < kFramesPorAmostra && (
          <div style={s.frameCounter}>acumulando {frames}/{kFramesPorAmostra}</div>
        )}
      </div>

      <div style={s.painel}>

        <div style={s.sinalWrap}>
          {!ativo && <span style={s.hint}>pressione iniciar</span>}
          {ativo && !reconhecido && (
            <span style={s.hint}>{frames < kFramesPorAmostra ? '...' : 'aguardando sinal'}</span>
          )}
          {ativo && reconhecido && (
            <span style={s.sinal}>{nomeExibido}</span>
          )}
        </div>

        {ativo && resultado?.todos && Object.keys(resultado.todos).length > 0 && (
          <div style={s.barras}>
            {Object.entries(resultado.todos).map(([sinal, conf]) => (
              <div key={sinal} style={s.barraRow}>
                <span style={s.barraLabel}>{sinal.replace('_', ' ')}</span>
                <div style={s.barraTrack}>
                  <div style={{
                    ...s.barraFill,
                    width: `${conf * 100}%`,
                    background: conf >= kLimiarConfianca ? '#4ade80' : '#60a5fa',
                  }} />
                </div>
                <span style={s.barraVal}>{(conf * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}

        {historico.length > 0 && (
          <div style={s.historico}>
            {historico.map((sinal, i) => (
              <span key={`${sinal}-${i}`} style={s.chip}>{sinal.replace('_', ' ')}</span>
            ))}
          </div>
        )}

        <button
          onClick={ativo ? parar : iniciar}
          disabled={!pronto || status !== 'ok'}
          style={{
            ...s.btn,
            background: ativo ? '#ef4444' : '#22c55e',
            opacity: (!pronto || status !== 'ok') ? 0.4 : 1,
          }}
        >
          {!pronto ? 'carregando...' : ativo ? 'parar' : 'iniciar'}
        </button>

      </div>
    </div>
  )
}

function corStatus(status) {
  if (status === 'ok') return '#22c55e'
  if (status === 'erro') return '#ef4444'
  if (status === 'carregando') return '#f59e0b'
  return '#6b7280'
}

const s = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0f172a', minHeight: '100vh', fontFamily: 'monospace', color: '#f1f5f9', padding: '24px 16px', gap: 20 },
  cameraWrap: { position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #334155', width: '100%', maxWidth: 560 },
  video: { width: '100%', display: 'block', background: '#1e293b' },
  badge: { position: 'absolute', top: 10, right: 10, fontSize: 11, padding: '3px 8px', borderRadius: 4, color: '#fff', fontFamily: 'monospace' },
  loading: { position: 'absolute', bottom: 10, left: 10, fontSize: 11, color: '#f59e0b', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4 },
  frameCounter: { position: 'absolute', bottom: 10, left: 10, fontSize: 11, color: '#94a3b8', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4 },
  painel: { width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 },
  sinalWrap: { textAlign: 'center', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sinal: { fontSize: 48, fontWeight: 'bold', letterSpacing: 2 },
  hint: { fontSize: 16, color: '#475569' },
  barras: { display: 'flex', flexDirection: 'column', gap: 6 },
  barraRow: { display: 'flex', alignItems: 'center', gap: 8 },
  barraLabel: { width: 80, fontSize: 12, color: '#94a3b8', textAlign: 'right' },
  barraTrack: { flex: 1, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' },
  barraFill: { height: '100%', borderRadius: 3, transition: 'width 0.15s ease' },
  barraVal: { width: 36, fontSize: 11, color: '#64748b', textAlign: 'right' },
  historico: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: { fontSize: 12, padding: '3px 10px', borderRadius: 20, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' },
  btn: { width: '100%', padding: '14px 0', borderRadius: 8, border: 'none', color: '#fff', fontSize: 15, fontFamily: 'monospace', cursor: 'pointer', letterSpacing: 1 },
}
