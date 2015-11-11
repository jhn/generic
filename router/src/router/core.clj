(ns router.core
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults api-defaults]]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [ring.util.response :refer [response]]
            [router.haproxy :as h])
  (:gen-class))

(def services
  (atom {}))

(defn register-service [{name :name regex :regex out :out}]
  (let [new-service {{:name name :regex regex} [out]}]
    (swap! services #(merge-with concat % new-service))
    (response {:status "ok"})))

(def template-path "haproxy.route.conf.clj")

(defn start [template-path bindings]
  (h/start-haproxy! template-path bindings)
  (response {:status "ok"}))

(defroutes app-routes
  (GET "/status" [] (response (str @services)))
  (POST "/register" {body :body} (register-service body))
  (POST "/start" [] (start template-path @services))
  (route/not-found "Not Found"))

(def app
  (-> app-routes
      (wrap-defaults api-defaults)
      (wrap-json-body {:keywords? true})
      (wrap-json-response)))
