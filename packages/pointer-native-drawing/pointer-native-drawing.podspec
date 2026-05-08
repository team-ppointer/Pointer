require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "pointer-native-drawing"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/team-ppointer/pointer-native-drawing"
  s.license      = package["license"]
  s.author       = "team-ppointer"
  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "https://github.com/team-ppointer/pointer-native-drawing.git", :tag => s.version.to_s }
  s.source_files = "ios/**/*.{h,m,mm,cpp}"

  install_modules_dependencies(s)
end
