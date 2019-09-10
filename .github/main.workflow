action "Publish" {
  uses = "./@master"
  args = "publish --access public"
  env = {
    NPM_REGISTRY_URL = "registry.npmjs.org"
  }
  secrets = ["NPM_AUTH_TOKEN"]
}