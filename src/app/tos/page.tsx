

"use client";
import Link from "next/link";
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle, Shield, Users } from "lucide-react";

export default function TOSPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <title>Kullanım Şartları - Preluvia</title>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Kullanım Şartları</h1>
            <p className="text-gray-600">Preluvia Platform Kullanım Koşulları</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-orange-600" />
                1. Genel Hükümler
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Bu kullanım şartları, Preluvia platformunu kullanırken geçerli olan kuralları ve 
                koşulları belirler. Platformu kullanarak bu şartları kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-3 text-orange-600" />
                2. Hizmet Tanımı
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Preluvia, toptan ürün satışı yapan bir e-ticaret platformudur. Platformumuz:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Ürün kataloğu sunar</li>
                  <li>Online sipariş alma hizmeti sağlar</li>
                  <li>Müşteri hesap yönetimi sunar</li>
                  <li>Sipariş takip sistemi sağlar</li>
                  <li>Müşteri destek hizmetleri sunar</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-orange-600" />
                3. Kullanıcı Yükümlülükleri
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">Platformu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Doğru ve güncel bilgiler vermek</li>
                  <li>Hesap güvenliğinizi korumak</li>
                  <li>Platformu yasal amaçlar için kullanmak</li>
                  <li>Diğer kullanıcıların haklarına saygı göstermek</li>
                  <li>Platform güvenliğini tehdit edecek davranışlardan kaçınmak</li>
                  <li>Telif haklarına uygun hareket etmek</li>
                  <li>Spam veya zararlı içerik paylaşmamak</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="w-6 h-6 mr-3 text-orange-600" />
                4. Yasaklı Kullanımlar
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">Aşağıdaki davranışlar kesinlikle yasaktır:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Yanlış veya yanıltıcı bilgi vermek</li>
                  <li>Başkalarının hesaplarını kullanmak</li>
                  <li>Platform güvenliğini tehdit etmek</li>
                  <li>Yasadışı faaliyetlerde bulunmak</li>
                  <li>Zararlı yazılım yaymak</li>
                  <li>Platform performansını etkileyecek aşırı kullanım</li>
                  <li>Diğer kullanıcıları taciz etmek</li>
                  <li>Platform kodlarını kopyalamak veya değiştirmek</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="w-6 h-6 mr-3 text-orange-600" />
                5. Sipariş ve Ödeme Koşulları
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">5.1 Sipariş Süreci</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Siparişler stok durumuna göre işlenir</li>
                  <li>Fiyatlar değişiklik gösterebilir</li>
                  <li>Minimum sipariş tutarı uygulanabilir</li>
                  <li>Sipariş onayı e-posta ile bildirilir</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">5.2 Ödeme Koşulları</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Ödemeler güvenli sistemler üzerinden yapılır</li>
                  <li>Kredi kartı bilgileri şifrelenir</li>
                  <li>Fatura bilgileri doğru verilmelidir</li>
                  <li>Ödeme onayından sonra sipariş işleme alınır</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-orange-600" />
                6. Gizlilik ve Güvenlik
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Kişisel verilerinizin korunması bizim için önemlidir. Detaylı bilgi için 
                  <Link href="/privacy" className="text-orange-600 hover:underline ml-1">
                    Gizlilik Politikamızı
                  </Link> 
                  inceleyebilirsiniz.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>SSL şifreleme kullanılır</li>
                  <li>Veriler güvenli sunucularda saklanır</li>
                  <li>Üçüncü taraflarla paylaşılmaz</li>
                  <li>Düzenli güvenlik denetimleri yapılır</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. İade ve İptal Koşulları</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">7.1 Sipariş İptali</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Sipariş onaylanmadan önce iptal edilebilir</li>
                  <li>Onaylanan siparişler için ek koşullar geçerlidir</li>
                  <li>İptal talepleri e-posta ile yapılmalıdır</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">7.2 Ürün İadesi</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Hasarlı ürünler için iade kabul edilir</li>
                  <li>İade süresi 14 gündür</li>
                  <li>Ürün orijinal ambalajında olmalıdır</li>
                  <li>İade kargo ücreti müşteriye aittir</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
                8. Sorumluluk Sınırları
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Preluvia, aşağıdaki durumlarda sorumluluk kabul etmez:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Kullanıcı hatalarından kaynaklanan sorunlar</li>
                  <li>Üçüncü taraf hizmet sağlayıcılarının hataları</li>
                  <li>Doğal afetler ve teknik sorunlar</li>
                  <li>Kullanıcının yanlış bilgi vermesi</li>
                  <li>Platform dışı işlemler</li>
                  <li>Yasal zorunluluklar</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Fikri Mülkiyet Hakları</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Platform üzerindeki tüm içerik, tasarım ve yazılım Preluvia'ya aittir. 
                  Bu içeriklerin kopyalanması, değiştirilmesi veya dağıtılması yasaktır.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Platform tasarımı ve arayüzü</li>
                  <li>Yazılım kodları ve algoritmalar</li>
                  <li>Marka ve logolar</li>
                  <li>İçerik ve materyaller</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Hesap Askıya Alma ve Kapatma</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Aşağıdaki durumlarda hesabınız askıya alınabilir veya kapatılabilir:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Kullanım şartlarının ihlali</li>
                  <li>Yanlış bilgi verilmesi</li>
                  <li>Güvenlik tehdidi oluşturması</li>
                  <li>Yasadışı faaliyetler</li>
                  <li>Diğer kullanıcıların haklarını ihlal etmesi</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Değişiklikler</h2>
              <p className="text-gray-700 leading-relaxed">
                Bu kullanım şartları zaman zaman güncellenebilir. Önemli değişiklikler olduğunda 
                sizi bilgilendireceğiz. Güncel şartlar her zaman web sitemizde yayınlanacaktır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. İletişim</h2>
              <p className="text-gray-700 leading-relaxed">
                Kullanım şartlarıyla ilgili sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>E-posta:</strong> legal@preluvia.com</p>
                <p className="text-gray-700"><strong>Adres:</strong> [Şirket Adresi]</p>
                <p className="text-gray-700"><strong>Telefon:</strong> [Telefon Numarası]</p>
              </div>
            </section>

            <div className="text-center pt-8 border-t">
              <p className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 