(ns router.core
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]])
  (:gen-class))

(def app-servers
  (atom #{}))

(defn register-server [ip]
  (swap! app-servers conj ip))

(defroutes app-routes
  (GET "/" [] "Hello World")
  (GET "/register/:ip" [ip] (register-server ip) "Ok!")
  (route/not-found "Not Found"))

(def app
  (wrap-defaults app-routes site-defaults))
