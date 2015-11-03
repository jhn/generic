(defproject router "0.1.0-SNAPSHOT"
  :description "A generic router"
  :url "http://example.com/OMGLOL"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.7.0"]
                 [ring/ring-jetty-adapter "1.4.0"]
                 [ring/ring-defaults "0.1.5"]
                 [compojure "1.4.0"]
                 [comb "0.1.0"]]
  :java-source-paths ["src/router"]
  :javac-options ["-target" "1.7" "-source" "1.7"]
  :plugins [[lein-ring "0.9.7"]]
  :ring {:handler router.core/app
         :nrepl {:start? true
                 :port 3001}}
  :aot [router.core])
