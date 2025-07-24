 
"use client";
import Link from "next/link";
import { ArrowLeft, Shield, User, Database, Eye, Lock } from "lucide-react";

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <title>KVKK Aydınlatma Metni - Preluvia</title>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">KVKK Aydınlatma Metni</h1>
            <p className="text-gray-600">Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                1. Veri Sorumlusu
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
                Preluvia ("Şirket") tarafından kişisel verilerinizin işlenmesine ilişkin olarak hazırlanmıştır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 mr-3 text-blue-600" />
                2. Toplanan Kişisel Veriler
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">Şirketimiz tarafından aşağıdaki kişisel veriler toplanmaktadır:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi</li>
                  <li><strong>İletişim Bilgileri:</strong> Telefon numarası, adres bilgileri</li>
                  <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, tarayıcı bilgileri</li>
                  <li><strong>Müşteri İşlemleri:</strong> Sipariş geçmişi, ödeme bilgileri</li>
                  <li><strong>İşlem Güvenliği:</strong> Şifre, kullanıcı adı</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-blue-600" />
                3. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Ürün ve hizmetlerimizin sunulması ve geliştirilmesi</li>
                  <li>Müşteri ilişkilerinin yönetimi ve iletişim</li>
                  <li>Sipariş işlemlerinin gerçekleştirilmesi</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                  <li>Pazarlama ve reklam faaliyetleri (izin verilmesi halinde)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-3 text-blue-600" />
                4. Kişisel Verilerin Aktarılması
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi kapsamında, 
                hizmet aldığımız tedarikçiler, iş ortakları ve yasal yükümlülüklerimiz gereği 
                kamu kurumları ile paylaşılabilir. Veri aktarımı, KVKK'nın 8. ve 9. maddelerinde 
                öngörülen koşullar çerçevesinde gerçekleştirilmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kişisel verileriniz, web sitemiz, mobil uygulamamız, çağrı merkezimiz ve 
                diğer iletişim kanalları aracılığıyla elektronik ortamda toplanmaktadır.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Hukuki Sebepler:</strong> Sözleşmenin kurulması ve ifası, yasal yükümlülüklerin 
                yerine getirilmesi, meşru menfaatin korunması ve açık rızanızın bulunması.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. KVKK Kapsamındaki Haklarınız</h2>
              <p className="text-gray-700 mb-4">KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>Kişisel verilerinizin aktarıldığı üçüncü kişilere yukarıda sayılan (e) ve (f) bentleri uyarınca yapılan işlemlerin bildirilmesini isteme</li>
                <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişiliğiniz aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. İletişim</h2>
              <p className="text-gray-700 leading-relaxed">
                Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki iletişim kanallarından 
                bizimle iletişime geçebilirsiniz:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>E-posta:</strong> kvkk@preluvia.com</p>
                <p className="text-gray-700"><strong>Adres:</strong> [Şirket Adresi]</p>
                <p className="text-gray-700"><strong>Telefon:</strong> [Telefon Numarası]</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Değişiklikler</h2>
              <p className="text-gray-700 leading-relaxed">
                Bu aydınlatma metni, yasal düzenlemelerdeki değişiklikler ve şirket politikalarımızdaki 
                güncellemeler doğrultusunda güncellenebilir. Güncel metin her zaman web sitemizde 
                yayınlanacaktır.
              </p>
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