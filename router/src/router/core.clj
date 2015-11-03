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

(defn merge-services [one two]
  (let [in (one :in-port)
        outs (into (one :out-port) (two :out-port))]
    {:in-port  in
     :out-port outs}))

(defn register-service [{name :name in :in-port out :out-port}]
  (let [new-service {name {:in-port  in
                           :out-port [out]}}]
    (swap! services
           #(merge-with merge-services % new-service))))

(defroutes app-routes
  (POST "/register" {body :body} (register-service body))
  (route/not-found "Not Found"))

(def app
  (-> app-routes
      (wrap-defaults api-defaults)
      (wrap-json-body {:keywords? true})
      (wrap-json-response)))
