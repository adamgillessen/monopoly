package practice;

import java.io.*;
import java.net.Socket;
import org.json.simple.JSONObject;

/**
 * Created by gilly on 11/02/17.
 *
 */
public class Client {
    public static void main(String[] args) throws IOException {

        JSONObject obj = new JSONObject();

        obj.put("name", "foo");
        obj.put("num", new Integer(100));
        obj.put("balance", new Double(1000.21));
        obj.put("is_vip", new Boolean(true));

        System.out.print(obj);

        // open a socket
        Socket socket = new Socket("localhost", 4444);

        // write text to the socket
        BufferedWriter bufferedWriter = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        bufferedWriter.write(obj.toString());
        bufferedWriter.flush();

        // read text from the socket
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        StringBuilder sb = new StringBuilder();
        String str;
        while ((str = bufferedReader.readLine()) != null)
        {
            sb.append(str + "\n");
        }

        // close the reader, and return the results as a String
        bufferedReader.close();

        // print out the result we got back from the server
        System.out.println(sb.toString());

        // close the socket, and we're done
        socket.close();
    }
}
