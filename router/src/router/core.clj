(ns router.core
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults api-defaults]]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [ring.util.response :refer [response]]
            [router.haproxy :as h])
  (:gen-class))

(def services-sample
  "Sample services map needed to generate a valid HAProxy template"
  (hash-map
    {:name "users-a-l" :regex "/users/[a-l]"} ["0.0.0.0:8000" "0.0.0.0:8001"]
    {:name "users-m-z" :regex "/users/[m-z]"} ["0.0.0.0:8002" "0.0.0.0:8003"]
    {:name "profiles"  :regex "/profiles"}    ["0.0.0.0:8004"]))

(def services
  (atom {}))

(defn register-service [{name :name regex :regex out :out}]
  (let [new-service {{:name name :regex regex} [out]}]
    (swap! services #(merge-with concat % new-service))
    (response {:status "ok"})))

(def template-path "haproxy.route.conf.clj")

(defn start! [template-path bindings]
  (h/start-haproxy! template-path bindings)
  (response {:status "ok"}))

(defn stop! []
  (h/stop-haproxy!)
  (response {:status "ok"}))

(defn reload! [template-path bindings]
  (h/reload-haproxy! template-path bindings)
  (response {:status "ok"}))

(defn reset-router! []
  (reset! services {})
  (response {:status "ok"}))

(defroutes app-routes
  (GET "/status" [] (response (str @services)))
  (POST "/register" {body :body} (register-service body))
  (POST "/start"  [] (start! template-path @services))
  (POST "/stop"   [] (stop!))
  (POST "/reload" [] (reload! template-path @services))
  (POST "/reset" [] (reset-router!))
  (route/not-found "Not Found"))

(def app
  (-> app-routes
      (wrap-defaults api-defaults)
      (wrap-json-body {:keywords? true})
      (wrap-json-response)))
