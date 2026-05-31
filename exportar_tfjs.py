from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow import keras
from tensorflow.keras import layers


SINAIS = ["Oi", "Tudo_bem", "Tchau"]
INPUT_SHAPE = (30, 258)


def construir_modelo() -> keras.Sequential:
    modelo = keras.Sequential(
        [
            layers.Input(shape=INPUT_SHAPE),
            layers.LSTM(64, return_sequences=True),
            layers.Dropout(0.3),
            layers.LSTM(128, return_sequences=True),
            layers.Dropout(0.3),
            layers.LSTM(64),
            layers.Dropout(0.3),
            layers.Dense(64, activation="relu"),
            layers.Dense(len(SINAIS), activation="softmax"),
        ]
    )
    modelo.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return modelo


def treinar_modelo(caminho_saida: Path, epocas: int, batch_size: int) -> keras.Model:
    tf.keras.utils.set_random_seed(42)

    x = np.load("X.npy").astype(np.float32)
    y = np.load("y.npy").astype(np.int32)
    y_cat = keras.utils.to_categorical(y, num_classes=len(SINAIS))

    x_train, x_val, y_train, y_val = train_test_split(
        x,
        y_cat,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    modelo = construir_modelo()
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=15,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=7,
            verbose=1,
        ),
    ]

    modelo.fit(
        x_train,
        y_train,
        validation_data=(x_val, y_val),
        epochs=epocas,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=2,
    )

    loss, acc = modelo.evaluate(x_val, y_val, verbose=0)
    print(f"validacao: loss={loss:.4f} acc={acc * 100:.1f}%")

    modelo.save(caminho_saida)
    print(f"modelo Keras salvo em {caminho_saida}")
    return modelo


def adicionar_peso(
    pesos: list[dict],
    partes: list[np.ndarray],
    nome: str,
    valor: np.ndarray,
) -> str:
    arr = np.asarray(valor, dtype="<f4")
    offset = sum(parte.size for parte in partes)
    partes.append(arr.reshape(-1))
    pesos.append(
        {
            "name": nome,
            "shape": list(arr.shape),
            "dtype": "float32",
            "offset": offset,
            "length": int(arr.size),
        }
    )
    return nome


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def lstm_numpy(
    sequencia: np.ndarray,
    kernel: np.ndarray,
    recurrent_kernel: np.ndarray,
    bias: np.ndarray,
    return_sequences: bool,
) -> np.ndarray:
    unidades = recurrent_kernel.shape[0]
    h = np.zeros((unidades,), dtype=np.float32)
    c = np.zeros((unidades,), dtype=np.float32)
    saidas = []

    for x_t in sequencia.astype(np.float32):
        z = x_t @ kernel + h @ recurrent_kernel + bias
        i, f, g, o = np.split(z, 4)
        c = sigmoid(f) * c + sigmoid(i) * np.tanh(g)
        h = sigmoid(o) * np.tanh(c)
        if return_sequences:
            saidas.append(h.copy())

    if return_sequences:
        return np.stack(saidas, axis=0).astype(np.float32)
    return h.astype(np.float32)


def dense_numpy(
    entrada: np.ndarray,
    kernel: np.ndarray,
    bias: np.ndarray,
    activation: str,
) -> np.ndarray:
    saida = entrada @ kernel + bias
    if activation == "relu":
        return np.maximum(saida, 0).astype(np.float32)
    if activation == "softmax":
        exp = np.exp(saida - np.max(saida))
        return (exp / np.sum(exp)).astype(np.float32)
    return saida.astype(np.float32)


def prever_numpy(camadas: list[dict], amostra: np.ndarray) -> np.ndarray:
    x = amostra.astype(np.float32)
    for camada in camadas:
        if camada["type"] == "lstm":
            x = lstm_numpy(
                x,
                camada["_kernel"],
                camada["_recurrent_kernel"],
                camada["_bias"],
                camada["returnSequences"],
            )
        elif camada["type"] == "dense":
            x = dense_numpy(
                x,
                camada["_kernel"],
                camada["_bias"],
                camada["activation"],
            )
    return x


def exportar_modelo(modelo: keras.Model, pasta_saida: Path) -> None:
    pasta_saida.mkdir(parents=True, exist_ok=True)

    pesos: list[dict] = []
    partes: list[np.ndarray] = []
    camadas: list[dict] = []

    lstm_idx = 0
    dense_idx = 0

    for camada in modelo.layers:
        if isinstance(camada, layers.LSTM):
            lstm_idx += 1
            nome = f"lstm_{lstm_idx}"
            kernel, recurrent_kernel, bias = camada.get_weights()

            camadas.append(
                {
                    "name": nome,
                    "type": "lstm",
                    "units": int(camada.units),
                    "returnSequences": bool(camada.return_sequences),
                    "kernel": adicionar_peso(pesos, partes, f"{nome}/kernel", kernel),
                    "recurrentKernel": adicionar_peso(
                        pesos,
                        partes,
                        f"{nome}/recurrent_kernel",
                        recurrent_kernel,
                    ),
                    "bias": adicionar_peso(pesos, partes, f"{nome}/bias", bias),
                    "_kernel": kernel.astype(np.float32),
                    "_recurrent_kernel": recurrent_kernel.astype(np.float32),
                    "_bias": bias.astype(np.float32),
                }
            )

        elif isinstance(camada, layers.Dense):
            dense_idx += 1
            nome = "saida" if dense_idx == 2 else f"dense_{dense_idx}"
            kernel, bias = camada.get_weights()
            activation = camada.activation.__name__

            camadas.append(
                {
                    "name": nome,
                    "type": "dense",
                    "units": int(camada.units),
                    "activation": activation,
                    "kernel": adicionar_peso(pesos, partes, f"{nome}/kernel", kernel),
                    "bias": adicionar_peso(pesos, partes, f"{nome}/bias", bias),
                    "_kernel": kernel.astype(np.float32),
                    "_bias": bias.astype(np.float32),
                }
            )

    if lstm_idx != 3 or dense_idx != 2:
        raise ValueError("Arquitetura inesperada: esperado 3 LSTM e 2 Dense.")

    manifest_camadas = [
        {k: v for k, v in camada.items() if not k.startswith("_")}
        for camada in camadas
    ]

    blob = np.concatenate(partes).astype("<f4")
    (pasta_saida / "weights.bin").write_bytes(blob.tobytes(order="C"))

    manifest = {
        "format": "libras-tfjs-sequential-v1",
        "generatedBy": f"TensorFlow {tf.__version__}",
        "weightsPath": "weights.bin",
        "inputShape": list(INPUT_SHAPE),
        "classes": SINAIS,
        "layers": manifest_camadas,
        "weights": pesos,
    }

    (pasta_saida / "model.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    x = np.load("X.npy").astype(np.float32)
    amostra = x[:1]
    pred_keras = modelo.predict(amostra, verbose=0)[0]
    pred_export = prever_numpy(camadas, amostra[0])
    diff = float(np.max(np.abs(pred_keras - pred_export)))

    print(f"TF.js custom export salvo em {pasta_saida}")
    print(f"pesos: {blob.nbytes / 1024:.0f} KB")
    print(f"checagem Keras vs export: diff max={diff:.8f}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Treina/carrega a LSTM de Libras e exporta pesos para rodar com TensorFlow.js."
    )
    parser.add_argument("--modelo", default="libras_model.keras")
    parser.add_argument("--saida", default="libras_model_tfjs")
    parser.add_argument("--epocas", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument(
        "--retrain",
        action="store_true",
        help="Treina novamente mesmo se o arquivo .keras ja existir.",
    )
    args = parser.parse_args()

    caminho_modelo = Path(args.modelo)
    pasta_saida = Path(args.saida)

    if caminho_modelo.exists() and not args.retrain:
        print(f"carregando {caminho_modelo}")
        modelo = keras.models.load_model(caminho_modelo)
    else:
        modelo = treinar_modelo(caminho_modelo, args.epocas, args.batch_size)

    exportar_modelo(modelo, pasta_saida)


if __name__ == "__main__":
    main()
