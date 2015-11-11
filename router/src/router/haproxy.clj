(ns router.haproxy
  (:require [clojure.java.io :as io]
            [comb.template :as template])
  (:import (router HAProxyController)))

(def ^:private hc
  (HAProxyController. "/usr/local/bin/"))

(defn parse [source-path binding]
  "Generates a HAProxy config with template at source-path as a string."
  (template/eval (slurp (io/resource source-path)) {:services binding}))

(defn write [source-path dest-path bindings]
  "Writes a HAProxy config with template at source-path to dest-path."
  (spit dest-path (parse source-path bindings)))

(defn start-haproxy! [source-path bindings]
  "Starts a HAProxy instance with config file at /tmp/haproxy.conf"
  (let [hc-template-path source-path
        hc-destination-path "/tmp/haproxy.conf"]
    (write  hc-template-path hc-destination-path bindings)
    (.start hc)))
