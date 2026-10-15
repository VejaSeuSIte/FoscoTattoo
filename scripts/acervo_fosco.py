"""Monta o material emprestado das outras identidades, já traduzido para o Fosco.

- gestos de canetão do UmRabiscoPsi (_RECON_EPSTEMIA/ACERVO_MARCACAO), recoloridos
  nas tintas do Fosco (o grão vem no alfa, então trocar a cor não estraga o traço)
- gravuras do acervo em creme, com o fundo de papel zerado, para entrar quase apagadas
  no fundo escuro
- o grão de papel de verdade (papel/grao_final.npy) nos objetos de papel claro
- a sombra do bambuzal da Raposa, como silhueta para a parede
- o dragão japonês de domínio público (Met, Gakutei) recortado para o quadro
- três fotos do estúdio tiradas do Instagram dele

Rodar: python scripts/acervo_fosco.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
PUB = RAIZ / "public"
EPS = Path(r"C:\Users\gabri\_RECON_EPSTEMIA")
RAPOSA = Path(r"C:\Users\gabri\RaposaAnalitica\public\raposa")

TINTAS = {
    "ambar": (216, 149, 76),
    "creme": (235, 223, 199),
    "tinta": (38, 26, 20),
    "selo": (163, 56, 42),
}


def salvar(im, destino, **kw):
    destino.parent.mkdir(parents=True, exist_ok=True)
    im.save(destino, **kw)
    print(f"{destino.relative_to(RAIZ)}  {im.size}  {destino.stat().st_size // 1024} KB")


# ---------------------------------------------------------------- gestos
GESTOS = [
    ("circulo", 3),
    ("circulo_duplo", 4),
    ("sublinhado_ondulado", 3),
    ("sublinhado", 2),
    ("sublinhado_zigzag", 5),
    ("seta_curva", 2),
    ("check", 2),
    ("asterisco", 2),
    ("xis", 3),
]


def gestos():
    for familia, n in GESTOS:
        fonte = EPS / "ACERVO_MARCACAO" / "creme" / f"{familia}_{n:02d}.png"
        alfa = Image.open(fonte).convert("RGBA").split()[3]
        alfa = alfa.resize((alfa.width // 2, alfa.height // 2), Image.LANCZOS)
        for cor, rgb in TINTAS.items():
            im = Image.new("RGBA", alfa.size, rgb + (255,))
            im.putalpha(alfa)
            salvar(im, PUB / "gestos" / f"{familia}-{cor}.webp", lossless=True, quality=100)


# ---------------------------------------------------------------- gravuras
GRAVURAS = ["L_mariposa2", "L_borboleta", "L_besouro2", "L_libelula3", "L_cavalo7", "L_lobo"]


def gravuras():
    for nome in GRAVURAS:
        im = Image.open(EPS / "gravuras" / "prontas2" / f"{nome}.png").convert("RGBA")
        luz = np.asarray(ImageOps.grayscale(im.convert("RGB")), dtype=np.float32)
        a0 = np.asarray(im.split()[3], dtype=np.float32) / 255
        # tinta escura vira traço; o papel (claro) e o grão somem
        alfa = np.clip((170 - luz) / 110, 0, 1) * a0
        alfa[alfa < 0.24] = 0  # o grão do papel não pode desenhar um retângulo em volta
        alfa = (alfa * 255).astype(np.uint8)
        saida = Image.new("RGBA", im.size, TINTAS["creme"] + (255,))
        saida.putalpha(Image.fromarray(alfa))
        caixa = saida.getbbox()
        if caixa:
            saida = saida.crop(caixa)
        saida.thumbnail((820, 820), Image.LANCZOS)
        a = saida.split()[3].filter(ImageFilter.MedianFilter(3)).point(lambda v: (v // 32) * 32 if v > 20 else 0)
        saida.putalpha(a)
        salvar(saida, PUB / "gravuras" / f"{nome[2:]}.webp", quality=78, alpha_quality=60, method=6)


# ---------------------------------------------------------------- papel
def papel():
    campo = np.load(EPS / "papel" / "grao_final.npy")  # 1440 x 1080, média zero, sd ~5,5
    if campo.shape[0] < campo.shape[1]:
        campo = campo.T
    h, w = campo.shape
    base = np.array([232, 218, 189], dtype=np.float32)
    # clareia o meio e escurece de leve a borda, como papel guardado
    yy, xx = np.mgrid[0:h, 0:w]
    borda = ((xx / w - 0.5) ** 2 + (yy / h - 0.5) ** 2) ** 0.5
    sombra = np.clip((borda - 0.32) * 26, 0, 14)[..., None]
    img = base[None, None, :] + campo[..., None] * 1.15 - sombra
    img = np.clip(img, 0, 255).astype(np.uint8)
    salvar(Image.fromarray(img), PUB / "textura" / "papel.jpg", quality=84, optimize=True)


# ---------------------------------------------------------------- sombra de bambu
def bambu():
    im = Image.open(RAPOSA / "arvore" / "bambuzal.webp").convert("RGBA")
    alfa = im.split()[3].filter(ImageFilter.GaussianBlur(3))
    sombra = Image.new("RGBA", im.size, (6, 4, 2, 255))
    sombra.putalpha(alfa)
    sombra.thumbnail((900, 900), Image.LANCZOS)
    salvar(sombra, PUB / "textura" / "bambu-sombra.webp", lossless=True, quality=100)


# ---------------------------------------------------------------- dragão
def dragao():
    # «Chinese Sage Evoking a Dragon», Yashima Gakutei, surimono de domínio público (Met 54336)
    im = Image.open(RAIZ / "_originais" / "acervo" / "dragao_54336_orig.jpg").convert("RGB")
    w, h = im.size
    recorte = im.crop((int(w * 0.035), int(h * 0.025), int(w * 0.965), int(h * 0.975)))
    recorte.thumbnail((760, 760), Image.LANCZOS)
    salvar(recorte, PUB / "acervo" / "dragao.webp", quality=84)


# ---------------------------------------------------------------- fotos do estúdio
def estudio():
    pasta = RAIZ / "_originais" / "instagram"
    for i, codigo in enumerate(["DdJi-xyETyd", "Dbe3RjEjNeD", "DchK1I2kRNn"], 1):
        im = Image.open(pasta / f"{codigo}.jpg").convert("RGB")
        salvar(im, PUB / "estudio" / f"{i:02d}.webp", quality=86)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        for etapa in sys.argv[1:]:
            globals()[etapa]()
        raise SystemExit
    gestos()
    gravuras()
    papel()
    bambu()
    dragao()
    estudio()
