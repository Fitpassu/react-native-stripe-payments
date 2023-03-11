require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-stripe-payments"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                   Lightweight, easy to integrate and use React native library for Stripe payments (using Payment Intents) compliant with SCA (strong customer authentication).
                   DESC
  s.homepage     = "https://github.com/Fitpassu/react-native-stripe-payments"
  s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Viktoras Laukevičius" => "viktoras.laukevicius@yahoo.com" }
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/Fitpassu/react-native-stripe-payments.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "Stripe", "~> 23.3.3"
end
