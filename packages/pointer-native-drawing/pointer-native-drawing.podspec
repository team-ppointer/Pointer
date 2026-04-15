require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "pointer-native-drawing"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/b0nsu/pointer-native-drawing"
  s.license      = package["license"]
  s.author       = "b0nsu"
  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "https://github.com/b0nsu/pointer-native-drawing.git", :tag => s.version.to_s }
  s.source_files = "ios/**/*.{h,m,mm,cpp}"

  s.dependency "react-native-skia"

  # Resolve Skia package from the consumer's node_modules (not the library root).
  # Pod::Config.instance.installation_root is the consumer's ios/ directory.
  consumer_root = File.expand_path("#{Pod::Config.instance.installation_root}/..")
  skia_pkg_json = `cd "#{consumer_root}" && node --print "require.resolve('@shopify/react-native-skia/package.json')"`.strip
  raise "Could not resolve @shopify/react-native-skia. Ensure node is in PATH." if skia_pkg_json.empty?
  skia_pkg = File.dirname(skia_pkg_json)
  # Enumerate Skia header paths explicitly (CocoaPods does not support /** globs
  # in HEADER_SEARCH_PATHS for external packages).
  skia_cpp = "#{skia_pkg}/cpp"
  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    "HEADER_SEARCH_PATHS" => [
      "\"#{skia_cpp}\"",
      "\"#{skia_cpp}/skia\"",
      "\"#{skia_cpp}/skia/include\"",
      "\"#{skia_cpp}/skia/include/core\"",
      "\"#{skia_cpp}/skia/include/pathops\"",
      "\"#{skia_cpp}/skia/include/effects\"",
      "\"#{skia_cpp}/skia/include/config\"",
      "\"#{skia_cpp}/skia/include/private\"",
      "\"#{skia_cpp}/skia/include/private/base\"",
      "\"#{skia_cpp}/api\"",
      "\"#{skia_cpp}/rnskia\"",
      "\"#{skia_cpp}/jsi\"",
      "\"#{skia_pkg}/apple\"",
    ].join(" "),
  }

  install_modules_dependencies(s)
end
