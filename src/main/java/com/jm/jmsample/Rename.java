package com.jm.jmsample;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Rename {

    public static void main(String[] args) throws Exception {

        String srcExt = "dat";
        String dstExt = "sam";

        Files.walk(Paths.get("C:\\Users\\파이리경로")).forEach(p -> {

            if (!p.getFileName().toString().endsWith(srcExt)) {
                return;
            }

            File f = p.toFile();

            String dir = f.getParentFile().getAbsolutePath();
            String newName = f.getName().replace("." + srcExt, "." + dstExt);

            try {
                Files.move(p, Paths.get(dir, newName));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        ;
    }

}
