"""
Brand Launch Simulator: 30 Hari Menuju Peluncuran
Game Master simulasi peluncuran produk "AURA" oleh NOVA Corp.
Jalankan: python UTS_TI_KELOMPOK_4.py
"""

import random
import time

BAR_LENGTH = 10

KOMPETITOR = {
    "Gadget Wellness": ("FitBro Ultra", "ZenTech Prime"),
    "Minuman Fungsional": ("PowerGuzzle", "HidupSehat Co."),
    "Skincare": ("GlowUp Official", "KulitBerseri Group"),
}

CRISIS_SCENARIOS = [
    {
        "judul": "Influencer Salah Paham",
        "cerita": "Seorang influencer besar mereview AURA di livestream dan malah bilang produk ini "
                   "'cocok buat yang mager doang', bikin netizen salah paham soal manfaat sebenarnya. "
                   "Klip itu viral dalam hitungan jam.",
        "shock_bs": -15,
        "shock_ms": 0,
    },
    {
        "judul": "Isu Kandungan Dipertanyakan",
        "cerita": "Thread di media sosial mempertanyakan salah satu kandungan/bahan AURA, lengkap dengan "
                   "'penelitian pribadi' yang setengah valid. Tagar #AwasAURA mulai naik.",
        "shock_bs": -20,
        "shock_ms": 0,
    },
    {
        "judul": "Serangan Perbandingan Harga",
        "cerita": "Kompetitor diam-diam menyebar infografis 'AURA vs Kami: Siapa Lebih Worth It?' "
                   "di media sosial mereka, dan itu lumayan menohok.",
        "shock_bs": -10,
        "shock_ms": -5,
    },
]


def clamp(v):
    return max(0, min(100, v))


def bar(value):
    filled = round(value / 100 * BAR_LENGTH)
    filled = max(0, min(BAR_LENGTH, filled))
    return "▓" * filled + "░" * (BAR_LENGTH - filled) + f" {value}/100"


def show_stats(state):
    print()
    print(f"📊 Market Share      : {bar(state['market_share'])}")
    print(f"💬 Brand Sentiment   : {bar(state['brand_sentiment'])}")
    print(f"💰 Budget Tersisa    : {bar(state['budget'])}")
    print()


def slow(text, delay=0.0):
    print(text)
    if delay:
        time.sleep(delay)


def ask_choice(prompt, options):
    print(prompt)
    for i, (label, _) in enumerate(options, 1):
        print(f"  {i}. {label}")
    while True:
        raw = input("Pilihanmu (1-{}): ".format(len(options))).strip()
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            return int(raw) - 1
        print("Input tidak valid, coba lagi ya.")


def apply(state, ms=0, bs=0, budget=0, trust=0):
    state["market_share"] = clamp(state["market_share"] + ms)
    state["brand_sentiment"] = clamp(state["brand_sentiment"] + bs)
    state["budget"] = clamp(state["budget"] + budget)
    state["team_trust"] = clamp(state["team_trust"] + trust)


def onboarding():
    print("=" * 60)
    print("  BRAND LAUNCH SIMULATOR: 30 HARI MENUJU PELUNCURAN")
    print("=" * 60)
    print("\nSelamat datang di NOVA Corp. Kamu baru saja ditunjuk jadi")
    print("Brand Manager untuk produk baru: AURA. 30 hari dari sekarang,")
    print("AURA harus meluncur ke pasar yang sudah dikuasai dua raksasa.\n")

    kategori_opsi = [
        ("Gadget Wellness", None),
        ("Minuman Fungsional", None),
        ("Skincare", None),
    ]
    kategori = kategori_opsi[ask_choice("Pilih kategori produk AURA:", kategori_opsi)][0]

    gaya_opsi = [
        ("Data-driven", None),
        ("Insting & Kreativitas", None),
        ("Kolaboratif", None),
    ]
    gaya = gaya_opsi[ask_choice("\nPilih gaya kepemimpinanmu:", gaya_opsi)][0]

    nickname = input("\nNama panggilanmu (boleh kosong): ").strip()
    if not nickname:
        nickname = "Bos"

    komp1, komp2 = KOMPETITOR[kategori]

    print("\n" + "-" * 60)
    print(f"📋 BRIEFING SINGKAT untuk {nickname}")
    print("-" * 60)
    print(f"Kategori   : {kategori}")
    print(f"Gaya Pimpin: {gaya}")
    print(f"Kompetitor : {komp1} (pemain lama, kuat di loyalitas) & "
          f"{komp2} (agresif di harga & iklan)")
    print("Sisa waktu : 30 hari menuju hari-H peluncuran AURA.")
    print("-" * 60)

    state = {
        "market_share": 20,
        "brand_sentiment": 50,
        "budget": 100,
        "team_trust": 50,
        "kategori": kategori,
        "gaya": gaya,
        "nickname": nickname,
        "komp1": komp1,
        "komp2": komp2,
        "min_bs_babak4": 100,
        "ending_secret": False,
    }
    show_stats(state)
    return state


def babak_1(state):
    print("\n=== BABAK 1: RISET & POSITIONING ===")
    slow("Tim riset sudah kumpulin data pasar. Sekarang giliranmu menentukan "
         "posisi AURA di benak konsumen.")

    opsi = [
        ("Premium eksklusif — mahal tapi bergengsi", "premium"),
        ("Mass-market terjangkau — murah, buat semua orang", "mass"),
        ("Hybrid 'accessible premium' — di tengah-tengah", "hybrid"),
    ]
    idx = ask_choice("\nBagaimana positioning AURA?", opsi)
    pilihan = opsi[idx][1]

    if pilihan == "premium":
        slow("\nAURA dibungkus sebagai barang eksklusif. Brand terasa mewah, tapi "
             "biaya branding awal membengkak dan jangkauan pasar jadi sempit.")
        apply(state, ms=-5, bs=10, budget=-15)
    elif pilihan == "mass":
        slow("\nAURA diposisikan buat semua kalangan. Potensi pasar melebar cepat, "
             "tapi sebagian orang mulai bisik-bisik 'kok murah banget, yakin bagus?'")
        apply(state, ms=10, bs=-5, budget=-5)
    else:
        slow("\nAURA jadi 'mewah tapi terjangkau' — strategi paling licin buat dijalanin. "
             "Pasar merespons cukup baik, tapi eksekusi dua sisi ini menyedot budget ekstra.")
        apply(state, ms=5, bs=5, budget=-10)

    show_stats(state)


def babak_2(state):
    print("\n=== BABAK 2: STRATEGI GO-TO-MARKET ===")
    slow("Waktunya alokasi budget promosi. Divisi marketing nunggu keputusanmu.")

    opsi = [
        ("Influencer Marketing — efek cepat ke Brand Sentiment, boros budget", "influencer"),
        ("Performance Ads — efek stabil ke Market Share, hemat tapi lambat", "ads"),
        ("Kombinasi 50:50 — efek moderat ke keduanya, risiko budget cepat habis", "combo"),
    ]
    idx = ask_choice("\nPilih strategi Go-to-Market:", opsi)
    pilihan = opsi[idx][1]

    if pilihan == "influencer":
        slow("\nLini masa langsung dibanjiri konten influencer. Sentimen publik "
             "melonjak cepat, tapi kas perusahaan ikut terkuras cepat juga.")
        apply(state, bs=15, budget=-25)
    elif pilihan == "ads":
        slow("\nIklan berjalan stabil dan efisien. Market share merangkak naik "
             "pelan tapi pasti, budget relatif aman.")
        apply(state, ms=15, bs=2, budget=-10)
    else:
        slow("\nKombinasi influencer + ads jalan bareng. Hasilnya lumayan merata, "
             "tapi budget tergerus dari dua arah sekaligus.")
        apply(state, ms=8, bs=8, budget=-20)

    show_stats(state)


def babak_3(state):
    print("\n=== BABAK 3: SALURAN DISTRIBUSI ===")
    slow("AURA sudah punya positioning dan gaung promosi. Sekarang: gimana caranya "
         "produk ini nyampe ke tangan konsumen?")

    opsi = [
        ("E-commerce eksklusif — jangkauan terbatas, kontrol kualitas tinggi", "ecom"),
        ("Ritel modern — jangkauan luas, biaya operasional tinggi", "ritel"),
        ("Omnichannel penuh — jangkauan maksimal, paling mahal & kompleks", "omni"),
    ]
    idx = ask_choice("\nPilih saluran distribusi:", opsi)
    pilihan = opsi[idx][1]

    if pilihan == "ecom":
        slow("\nAURA cuma bisa dibeli online. Kesannya eksklusif dan terkurasi rapi, "
             "tapi orang yang gaptek belanja online otomatis kelewatan.")
        apply(state, ms=5, bs=5, budget=-5)
    elif pilihan == "ritel":
        slow("\nAURA nampang di rak minimarket dan supermarket se-kota. Jangkauan "
             "meledak, tapi display di toko kadang berantakan dan kesan premium luntur.")
        apply(state, ms=15, bs=-5, budget=-15)
    else:
        slow("\nAURA ada di mana-mana: online, ritel, semua kanal jalan bareng. "
             "Jangkauan dan citra sama-sama naik, tapi kompleksitas operasional "
             "bikin tim pusing dan kas jebol.")
        apply(state, ms=12, bs=5, budget=-25, trust=-5)

    show_stats(state)


def babak_bonus(state):
    print("\n=== BABAK BONUS: LANGKAH TAK TERDUGA KOMPETITOR ===")
    kejadian = random.choice(["harga", "produk_mirip"])
    if kejadian == "harga":
        slow(f"Tiba-tiba, {state['komp2']} mengumumkan diskon 30% dadakan buat semua "
             "produk sejenis AURA. Timeline langsung ramai bandingin harga.")
    else:
        slow(f"{state['komp1']} diam-diam merilis varian baru yang mirip banget "
             "konsepnya sama AURA — dan mereka duluan yang tayang.")

    opsi = [
        ("Ikut banting harga sekarang juga", "banting"),
        ("Perkuat narasi diferensiasi, nggak ikut perang harga", "diferensiasi"),
        ("Buru-buru rilis fitur/varian baru sebagai balasan", "buru"),
    ]
    idx = ask_choice("\nGimana reaksimu?", opsi)
    pilihan = opsi[idx][1]

    if pilihan == "banting":
        slow("\nHarga ikut turun, penjualan langsung kebantu. Tapi sebagian orang "
             "menilai AURA jadi terlihat 'panik' ngikutin kompetitor.")
        apply(state, ms=8, bs=-3, budget=-15)
    elif pilihan == "diferensiasi":
        slow("\nTim komunikasi gencar menonjolkan nilai unik AURA tanpa ikut perang "
             "harga. Efeknya nggak instan ke penjualan, tapi investor suka disiplin ini.")
        apply(state, ms=-3, bs=8, trust=5)
    else:
        slow("\nTim begadang kejar tayang fitur baru dalam waktu singkat. Berhasil "
             "curi sedikit perhatian pasar, tapi tim keteteran dan kualitas jadi taruhan.")
        apply(state, ms=5, budget=-20, trust=-8)

    show_stats(state)


def babak_4(state):
    print("\n=== BABAK 4: KRISIS PR MENDADAK ===")
    crisis = random.choice(CRISIS_SCENARIOS)
    slow(f"🚨 {crisis['judul']}")
    slow(crisis["cerita"])

    apply(state, ms=crisis["shock_ms"], bs=crisis["shock_bs"])
    state["min_bs_babak4"] = min(state["min_bs_babak4"], state["brand_sentiment"])
    print(f"\n(Brand Sentiment langsung anjlok jadi {state['brand_sentiment']}/100!)")

    opsi = [
        ("Klarifikasi terbuka & transparan", "klarifikasi"),
        ("Diam & tunggu redam", "diam"),
        ("Serang balik kompetitor/influencer", "serang"),
    ]
    idx = ask_choice("\nKamu punya waktu terbatas. Bagaimana responsmu?", opsi)
    pilihan = opsi[idx][1]

    if pilihan == "klarifikasi":
        slow("\nTim bikin pernyataan resmi, transparan soal fakta produk, dan "
             "buka sesi tanya-jawab publik. Publik menghargai keterbukaan ini, "
             "dan tim internal merasa dipimpin dengan jelas.")
        apply(state, bs=12, trust=10, budget=-5)
    elif pilihan == "diam":
        slow("\nKamu memilih tidak merespons dan berharap isu ini reda sendiri. "
             "Sialnya, keheningan itu malah dibaca sebagai 'menyembunyikan sesuatu', "
             "dan tim jadi bingung karena tidak ada arahan sama sekali.")
        apply(state, bs=-15, trust=-5)
    else:
        slow("\nAURA balas menyerang lewat media sosial. Sebagian fans bersorak, "
             "tapi sebagian tim menilai langkah ini nggak profesional dan berisiko "
             "menyulut drama baru.")
        apply(state, bs=5, ms=3, trust=-10)

    state["min_bs_babak4"] = min(state["min_bs_babak4"], state["brand_sentiment"])
    show_stats(state)


def babak_5(state):
    print("\n=== BABAK 5: HARI PELUNCURAN ===")
    slow("Hari-H tiba. Ini keputusan terakhir sebelum AURA resmi meluncur ke publik.")

    opsi = [
        ("Harga premium, stok terbatas, pesan kampanye eksklusif", "premium"),
        ("Harga kompetitif, stok besar, pesan kampanye mass appeal", "mass"),
        ("Harga moderat, stok seimbang, pesan kampanye cerita otentik brand", "otentik"),
    ]
    idx = ask_choice("\nPilih strategi peluncuran final:", opsi)
    pilihan = opsi[idx][1]

    if pilihan == "premium":
        slow("\nAURA meluncur eksklusif dengan stok terbatas. Yang berhasil beli "
             "merasa istimewa, tapi banyak calon pembeli kehabisan dan kecewa.")
        apply(state, ms=-5, bs=10, budget=-5)
    elif pilihan == "mass":
        slow("\nAURA banjir di pasaran dengan harga terjangkau. Penjualan meroket "
             "dalam hitungan hari, tapi produksi besar-besaran menguras kas dan "
             "sebagian orang mulai meragukan eksklusivitas brand.")
        apply(state, ms=15, bs=-5, budget=-15)
    else:
        slow("\nAURA meluncur dengan cerita brand yang jujur dan pas-pasan secara "
             "harga. Responsnya seimbang: tidak meledak, tapi terasa otentik dan "
             "tim merasa bangga dengan cara ini dijalankan.")
        apply(state, ms=8, bs=8, budget=-10, trust=5)

    show_stats(state)


def determine_ending(state):
    ms = state["market_share"]
    bs = state["brand_sentiment"]

    if state["min_bs_babak4"] < 30 and bs >= 60:
        return (
            "✨ The Comeback Kid",
            "Sukses",
            f"{state['nickname']} sempat melihat Brand Sentiment AURA anjlok parah saat krisis, "
            "titik paling rawan sepanjang 30 hari ini. Tapi bukannya panik, tim bangkit dan "
            "membalikkan keadaan sampai kepercayaan publik pulih total. Di ruang rapat direksi, "
            "cerita ini jadi legenda internal — bukan soal seberapa besar AURA jadi, tapi soal "
            "bagaimana krisis terburuk berhasil dibalik jadi kemenangan terbesar."
        )

    if ms >= 70 and bs >= 70:
        return (
            "🏆 Market Leader Sejati",
            "Sukses",
            f"AURA resmi jadi pemimpin pasar baru. Angka penjualan dan sentimen publik sama-sama "
            f"solid, dan direksi NOVA Corp langsung mempromosikan {state['nickname']} jadi Head "
            "of Brand. 30 hari yang melelahkan, tapi terbayar lunas."
        )

    if ms >= 70 and bs < 50:
        return (
            "🔥 Viral tapi Rapuh",
            "Sukses dengan Catatan",
            "Penjualan AURA meledak dalam semalam, tapi di balik angka yang mentereng, publik "
            "menilai brand ini cuma 'hype kosong'. Analis internal memperingatkan: tanpa fondasi "
            "sentimen yang kuat, AURA rentan collapse dalam tiga bulan ke depan."
        )

    if ms < 40 and bs >= 70:
        return (
            "💎 Cult Brand Nichemu",
            "Sukses dengan Catatan",
            "AURA nggak pernah jadi arus utama, tapi punya basis pelanggan yang fanatik dan loyal. "
            "Angka penjualan kecil, namun beberapa investor niche mulai melirik AURA justru karena "
            "kedekatan emosional komunitasnya."
        )

    if ms < 40 and bs < 40:
        return (
            "💀 Produk Ditarik dari Pasar",
            "Gagal",
            f"Krisis yang menghantam AURA tidak pernah benar-benar tertangani. Direksi memutuskan "
            f"menarik AURA dari pasar, dan {state['nickname']} harus duduk di ruang rapat post-mortem "
            "menjelaskan apa yang salah dari awal sampai akhir."
        )

    return (
        "⚠️ Bertahan Hidup Pas-pasan",
        "Sukses dengan Catatan",
        f"Peluncuran AURA berjalan aman-aman saja: tidak gagal total, tapi juga jauh dari "
        f"gemilang. Kontrak {state['nickname']} diperpanjang, dengan catatan performa yang "
        "masih harus banyak dibenahi di kuartal berikutnya."
    )


def report_card(state):
    print("\n" + "=" * 60)
    print("📋 LAPORAN AKHIR — BRAND LAUNCH SIMULATOR")
    print("=" * 60)

    nama_ending, status, epilog = determine_ending(state)

    print(f"Nama Brand Manager     : {state['nickname']}")
    print(f"Kategori Produk        : {state['kategori']}")
    print(f"Market Share Akhir     : {state['market_share']}/100")
    print(f"Brand Sentiment Akhir  : {state['brand_sentiment']}/100")
    print(f"Budget Tersisa         : {state['budget']}/100")
    print(f"Kepercayaan Tim (terungkap) : {state['team_trust']}/100")
    print(f"STATUS                 : {status}")
    print(f"ENDING                 : {nama_ending}")
    print("-" * 60)
    print(epilog)
    print("-" * 60)
    print("\nMau coba jalur berbeda? Main ulang dan lihat apakah kamu bisa raih ending lain!")


def main():
    random.seed()
    state = onboarding()

    babak_1(state)
    babak_2(state)

    bonus_triggered = random.random() < 0.30
    bonus_after = random.choice([2, 3]) if bonus_triggered else None
    if bonus_after == 2:
        babak_bonus(state)

    babak_3(state)
    if bonus_after == 3:
        babak_bonus(state)

    babak_4(state)
    babak_5(state)

    report_card(state)


if __name__ == "__main__":
    main()
