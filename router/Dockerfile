FROM java:8

RUN apt-get update

ADD target/router-0.1.0-SNAPSHOT-standalone.jar /srv/router.jar

CMD ["java", "-jar", "/srv/router.jar"]

