(ns router.haproxy
  (:require [clojure.java.io :as io]
            [comb.template :as template])
  (:import (router HAProxyController)))

(def ^:private hc
  (HAProxyController. "/usr/local/bin/"))

(defn- parse [path binding]
  (template/eval (slurp (io/resource path)) {:services binding}))

(defn- write [source dest bindings]
  (spit dest (parse source bindings)))

(defn start-haproxy! [bindings]
  (let [hc-template-path "haproxy.conf.clj"
        hc-destination-path "/tmp/haproxy.conf"]
    (write  hc-template-path hc-destination-path bindings)
    (.start hc)))
