# Hafta 2 — Kısa Düşünce

## 1) Worktree egzersizinde hata + özelliği paralel yürütmek kolay mı zor mu oldu?

Nispeten kolaydı. Hafta 2 geliştirmelerini ayrı bir branch'te yürüttüm; main branch'te ise yapay zekânın bulduğu hataları düzelttim. En sonunda branch'i main ile merge ederek işi tamamladım. Tek zorlandığım nokta, yapay zekâyı kullanırken o an main'de mi yoksa branch'te mi olduğumu takip etmekti.

## 2) Mobil portta web'den farklı en çok neyi değiştirmen gerekti?

En çok tasarım/CSS tarafını değiştirmem gerekti. İlk çıkan mobil ekranda stiller çok kaymıştı, öğeler dağınıktı ve genel görünüm oldukça ilkeldi. Bu yüzden düzeni elden geçirip ekranı belirgin biçimde güzelleştirmem gerekti.


# Hafta 1 — Kısa Düşünce

## 1) Veri modelini planlarken (/plan) BizCard'dakinden farklı ne fark ettim?

Veri modeli BizCard'a göre kategori vb. detaylar bulunduğundan dolayı daha detaylı olarak oluşturdu.

Veri modeli içerisinde bir çok Product, Category, Price gibi modüller oluşturuldu.

## 2) Skill / MCP / Sub-agent'tan hangisi bu ikinci denemede daha kolay geldi, neden?

**En çok işime yarayan: Skill.** `atolyekart-standards`

Bu skill sayesinde sistematik bir yazılım geliştirme ve webhook yapısı oluşturabildim.

**MCP / GitHub:** Repoyu GitHub MCP yerine CLI ile oluşturdum; sonuç aynı oldu.

Şifre tanımlama ve her seferinde o şifreyle github'a girebilmesi için olan yapıyı kurarken birkaç hata aldım ancak düzeltmem zor olmadı.

**Sub-agent:** Bu ödevin son kısmını, Superpowers plugin indeki subagent-driven-development akışıyla yürüttüm. İmplemente etme ve üzerine inceleme yapısıyla ilerlediğimden dolayı, benim farketmeyeceğim zor bugları buldu ancak bunu yapmasıyla token ve süreden feragat etmem gerekti. Güvenli ve denetimli bir uygulama yapmak için daha iyi bir sistem gibi gözüküyor.

