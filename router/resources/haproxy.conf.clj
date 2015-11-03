global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

<% (doseq [[name v] services]
      %>frontend <%= name %>-in
    bind *:<%= (v :in-port) %>
    default_backend <%= name %>-backends

backend <%= name %>-backends
    <% (doseq [[idx out] (map-indexed vector (v :out-port))]
        %>server <%= (str name idx) %> 127.0.0.1:<%=out%> maxconn 32
    <%
       )
%><%) %>

