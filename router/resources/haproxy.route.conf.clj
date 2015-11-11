global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend http
    bind *:9999
    <% (doseq [[{name :name regex :regex}] services]
      %>acl <%= name %>-regex path_reg <%= regex %>
    use_backend <%= name %>-backends if <%= name %>-regex
    <%) %> <% (doseq [[{name :name} outs] services]
        %>
backend <%= name %>-backends
    balance roundrobin
    <% (doseq [[idx out] (map-indexed vector outs)]
        %>server <%= (str name "-" idx) %> <%= out %> maxconn 32
    <%
       )
%><%) %>
