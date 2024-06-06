package com.jm.jmsample;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Rename {

    public static void main(String[] args) throws Exception {

        Files.walk(Paths.get("C:\\Users\\원종만\\Downloads\\새 폴더 (5)")).forEach(p -> {

            if (!p.getFileName().toString().endsWith("webp")) {
                return;
            }

            File f = p.toFile();

            String dir = f.getParentFile().getAbsolutePath();
            String newName = f.getName().replace(".webp", ".png");

            try {
                Files.move(p, Paths.get(dir, newName));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        ;
    }

}
