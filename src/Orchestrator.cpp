void Orchestrator::submit_job(int start, int end) {

    int num_nodes = resources._peers.size();

    if (num_nodes == 0) {
        std::cout << "No peers, running locally\n";
        return;
    }

    auto jobs = split_job(start, end, num_nodes);

    int i = 0;
    for (auto& [ip, peer] : resources._peers) {
        std::string data = serialize_job(jobs[i]);
        network.send_string(ip, "/job", data);
        i++;
    }
}