package router;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HAProxyController {
    private String executablePath;

    public HAProxyController(String executablePath) {
        this.executablePath = executablePath;
        if (!this.executablePath.endsWith("haproxy")) {
            if (!this.executablePath.endsWith("/")) {
                this.executablePath += "/";
            }
            this.executablePath += "haproxy";
        }

        killAll("haproxy");
    }

    public void start() throws Exception {
        File conf = new File("/tmp/haproxy.conf");
        if (!conf.exists()) {
            throw new Exception("/tmp/haproxy.conf does not exists");
        }

        String command = executablePath + " -f /tmp/haproxy.conf -p /tmp/haproxy.pid";
        runCommand(command);
    }

    public void stop() throws Exception {
        killAll("haproxy");
    }

    public void reload() throws Exception {
        String pid = new String(Files.readAllBytes(Paths.get("/tmp/haproxy.pid")));
        String command = executablePath + " -f /tmp/haproxy.conf -p /tmp/haproxy.pid -sf " + pid;
        runCommand(command);
    }

    private void killAll(String processName) {
        runCommand("killall " + processName);
    }

    private void runCommand(String command) {
        try {
            Runtime.getRuntime().exec(command);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
